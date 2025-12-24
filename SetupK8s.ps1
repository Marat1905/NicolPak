# ============================================
# СКРИПТ ДЛЯ УСТАНОВКИ KUBERNETES И КОМПОНЕНТОВ
# С ВИЗУАЛИЗАЦИЕЙ ПРОГРЕССА И ЭТАПОВ
# ============================================

# Настройки
$vmIPs = @(
    @{IP = "192.168.137.20"; Role = "master"; Hostname = "uchaly-k8s-master01"},
    @{IP = "192.168.137.21"; Role = "worker"; Hostname = "uchaly-k8s-worker01"},
    @{IP = "192.168.137.22"; Role = "worker"; Hostname = "uchaly-k8s-worker02"}
)

$Username = "admin"
$Password = "P@ssw0rd123"

# Версии компонентов
$KubernetesVersion = "1.33.4"
$ContainerdVersion = "2.1.5"
$RuncVersion = "1.3.0"
$CNIPluginsVersion = "1.7.1"
$CalicoVersion = "3.30.2"
$CrictlVersion = "1.33.0"
$HelmVersion = "3.17.0"
$KomposeVersion = "1.37.0"

# URL для загрузки (GitHub как fallback)
$KubernetesBaseURL = "https://dl.k8s.io"
$KubernetesGitHubURL = "https://dl.k8s.io"

# Глобальные переменные для отслеживания прогресса
$global:TotalSteps = 0
$global:CurrentStep = 0
$global:StartTime = Get-Date

# Функция для вывода этапа с прогрессом
function Write-Step {
    param(
        [string]$Message,
        [string]$Status = "INFO",
        [string]$Color = "Cyan"
    )
    
    $global:CurrentStep++
    $timestamp = Get-Date -Format "HH:mm:ss"
    $stepInfo = "[$timestamp] [Этап $global:CurrentStep/$global:TotalSteps]"
    
    switch ($Status) {
        "INFO" { 
            Write-Host "$stepInfo $Message" -ForegroundColor $Color
        }
        "SUCCESS" { 
            Write-Host "$stepInfo ✓ $Message" -ForegroundColor Green
        }
        "WARNING" { 
            Write-Host "$stepInfo ⚠ $Message" -ForegroundColor Yellow
        }
        "ERROR" { 
            Write-Host "$stepInfo ✗ $Message" -ForegroundColor Red
        }
        "START" { 
            Write-Host "$stepInfo ▶ $Message" -ForegroundColor Magenta
        }
        "END" { 
            Write-Host "$stepInfo ✓ $Message завершен" -ForegroundColor Green
        }
    }
}

# Функция для вывода подэтапа
function Write-SubStep {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    switch ($Status) {
        "INFO" { 
            Write-Host "  [$timestamp] $Message" -ForegroundColor Gray
        }
        "SUCCESS" { 
            Write-Host "  [$timestamp] ✓ $Message" -ForegroundColor DarkGreen
        }
        "RUNNING" { 
            Write-Host "  [$timestamp] ▶ $Message..." -ForegroundColor DarkCyan
        }
        "WARNING" { 
            Write-Host "  [$timestamp] ⚠ $Message" -ForegroundColor DarkYellow
        }
        "ERROR" { 
            Write-Host "  [$timestamp] ✗ $Message" -ForegroundColor DarkRed
        }
    }
}

# Функция для вывода прогресс-бара
function Show-ProgressBar {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity = "Прогресс",
        [string]$Status = "Выполнение"
    )
    
    $percentComplete = [math]::Round(($Current / $Total) * 100)
    $bars = [math]::Round($percentComplete / 2)
    $progressBar = "[" + ("#" * $bars) + (" " * (50 - $bars)) + "]"
    
    Write-Host "`r$Activity $progressBar $percentComplete% $Status" -NoNewline -ForegroundColor Cyan
}

# Функция для выполнения команды через Plink
function Invoke-PlinkCommand {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Command,
        [string]$StepName = "",
        [int]$Timeout = 300
    )
    
    try {
        $plinkPath = Get-Command plink.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
        if (-not $plinkPath) {
            $possiblePaths = @(
                "$env:ProgramFiles\PuTTY\plink.exe",
                "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
                "$env:USERPROFILE\Downloads\plink.exe",
                "$env:TEMP\plink.exe"
            )
            
            foreach ($path in $possiblePaths) {
                if (Test-Path $path) {
                    $plinkPath = $path
                    break
                }
            }
        }
        
        if (-not $plinkPath) {
            Write-SubStep "Plink не найден" -Status "ERROR"
            return $null
        }
        
        # Показываем прогресс выполнения команды
        if ($StepName) {
            Write-SubStep "Выполнение: $StepName" -Status "RUNNING"
        }
        
        # Выполняем команду
        $output = & $plinkPath -ssh $IP -l $User -pw $Pass -batch $Command 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            if ($StepName) {
                Write-SubStep "$StepName завершен" -Status "SUCCESS"
            }
        } else {
            if ($StepName) {
                Write-SubStep "$StepName завершен с ошибкой (код: $LASTEXITCODE)" -Status "WARNING"
            }
        }
        
        return [PSCustomObject]@{
            Output = if ($output) { $output -join "`n" } else { "" }
            ExitCode = $LASTEXITCODE
        }
    }
    catch {
        Write-SubStep "Ошибка выполнения: $($_.Exception.Message)" -Status "ERROR"
        return $null
    }
}

# Функция для проверки SSH доступности
function Test-SSHConnection {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass
    )
    
    $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command "echo 'SSH_TEST_SUCCESS'" 
    return ($result -and $result.Output -like "*SSH_TEST_SUCCESS*")
}

# Функция для установки Kubernetes компонентов с GitHub
function Install-KubernetesFromGitHub {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Hostname
    )
    
    Write-SubStep "Загрузка Kubernetes компонентов с GitHub" -Status "RUNNING"
    
    # Команды для установки - используем простой подход без сложного экранирования
    $installCommands = @(
        # Создаем временный каталог
        "mkdir -p /tmp/k8s-install",
        
        # Останавливаем kubelet, если он запущен
        "sudo systemctl stop kubelet 2>/dev/null || true",
        
        # Удаляем существующие файлы, если они есть
        "sudo rm -f /usr/local/bin/kubelet /usr/local/bin/kubeadm /usr/local/bin/kubectl 2>/dev/null || true",
        
        # Загружаем бинарные файлы с GitHub
        "wget -q $KubernetesGitHubURL/v$KubernetesVersion/kubernetes-server-linux-amd64.tar.gz -O /tmp/k8s-install/kubernetes-server.tar.gz",
        
        # Распаковываем
        "tar -xzf /tmp/k8s-install/kubernetes-server.tar.gz -C /tmp/k8s-install/",
        
        # Устанавливаем kubelet, kubeadm, kubectl с использованием install команды (более надежно)
        "sudo install -m 0755 /tmp/k8s-install/kubernetes/server/bin/kubelet /usr/local/bin/kubelet",
        "sudo install -m 0755 /tmp/k8s-install/kubernetes/server/bin/kubeadm /usr/local/bin/kubeadm",
        "sudo install -m 0755 /tmp/k8s-install/kubernetes/server/bin/kubectl /usr/local/bin/kubectl",  
        
        # Очистка временных файлов
        "rm -rf /tmp/k8s-install"
    )
    
    foreach ($cmd in $installCommands) {
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
        if (-not $result -or $result.ExitCode -ne 0) {
            # Пропускаем некоторые не критичные ошибки
            if ($cmd -match "systemctl stop kubelet" -or $cmd -match "rm -f") {
                Write-SubStep "Предупреждение при выполнении: $cmd" -Status "WARNING"
                continue
            }
            Write-SubStep "Ошибка при установке с GitHub: $cmd" -Status "ERROR"
            if ($result) {
                Write-SubStep "Детали: $($result.Output)" -Status "ERROR"
            }
            return $false
        }
    }
    
    Write-SubStep "Установка с GitHub завершена" -Status "SUCCESS"
    return $true
}

# Функция для отключения systemd-resolved
function Disable-SystemdResolved {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass
    )
    
    Write-SubStep "Отключение systemd-resolved" -Status "RUNNING"
    
    $commands = @(
        # Останавливаем и отключаем systemd-resolved
        "sudo systemctl stop systemd-resolved 2>/dev/null || true",
        "sudo systemctl disable systemd-resolved 2>/dev/null || true",
        "sudo systemctl mask systemd-resolved 2>/dev/null || true",
        
        # Удаляем symlink resolv.conf
        "sudo rm -f /etc/resolv.conf 2>/dev/null || true",
        
        # Создаем новый resolv.conf с публичными DNS
        "echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf",
        "echo 'nameserver 8.8.4.4' | sudo tee -a /etc/resolv.conf",
        "echo 'options timeout:2 attempts:3' | sudo tee -a /etc/resolv.conf",
        
        # Запрещаем systemd менять resolv.conf
        "sudo ln -sf /etc/resolv.conf /run/systemd/resolve/stub-resolv.conf 2>/dev/null || true",
        "sudo ln -sf /etc/resolv.conf /run/systemd/resolve/resolv.conf 2>/dev/null || true",
        
        # Проверяем
        "echo 'Проверка resolv.conf:'",
        "cat /etc/resolv.conf",
        "echo ''",
        "echo 'Проверка статуса systemd-resolved:'",
        "systemctl status systemd-resolved 2>/dev/null | head -5 || echo 'systemd-resolved отключен'"
    )
    
    foreach ($cmd in $commands) {
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
        if (-not $result -or $result.ExitCode -ne 0) {
            # Не критичные ошибки для некоторых команд
            if ($cmd -match "2>/dev/null" -or $cmd -match "|| true") {
                continue
            }
            Write-SubStep "Предупреждение при отключении systemd-resolved: $cmd" -Status "WARNING"
        }
    }
    
    Write-SubStep "systemd-resolved отключен" -Status "SUCCESS"
}

# Функция для установки Helm 3.17.0 на master узел
function Install-Helm {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Hostname
    )
    
    Write-Step "Установка Helm 3.17.0 на $Hostname" -Status "START"
    
    $helmVersion = "3.17.0"
    Write-SubStep "Скачивание и установка Helm v$helmVersion" -Status "RUNNING"
    
    # Команды для установки Helm
    $installCommands = @(
        # Создаем временный каталог
        "mkdir -p /tmp/helm-install",
        
        # Загружаем Helm
        "wget -q https://get.helm.sh/helm-v$helmVersion-linux-amd64.tar.gz -O /tmp/helm-install/helm.tar.gz",
        
        # Распаковываем
        "tar -xzf /tmp/helm-install/helm.tar.gz -C /tmp/helm-install/",
        
        # Устанавливаем бинарный файл
        "sudo install -m 0755 /tmp/helm-install/linux-amd64/helm /usr/local/bin/helm",
        
        # Проверяем установку
        "helm version --short",
        
        # Очистка временных файлов
        "rm -rf /tmp/helm-install",
        
        # Настройка репозиториев Helm
        "helm repo add stable https://charts.helm.sh/stable",
        "helm repo add jetstack https://charts.jetstack.io",
        "helm repo add prometheus-community https://prometheus-community.github.io/helm-charts",
        "helm repo add grafana https://grafana.github.io/helm-charts",
        
        # Обновляем репозитории
        "helm repo update",
        
        # Создаем скрипт проверки Helm
        'echo "#!/bin/bash" | sudo tee /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"=== Проверка Helm установки ===\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "helm version --short && echo \"✓ Helm установлен\" || echo \"✗ Helm не установлен\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"Доступные репозитории:\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "helm repo list" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"Примеры команд Helm:\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"  helm search repo nginx             # Поиск чартов\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"  helm list -A                      # Список всех релизов\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"  helm install my-release stable/nginx  # Установка чарта\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'echo "echo \"  helm install bitnami-chart oci://registry-1.docker.io/bitnamicharts/nginx  # Установка Bitnami через OCI\"" | sudo tee -a /usr/local/bin/check-helm.sh > /dev/null',
        'sudo chmod +x /usr/local/bin/check-helm.sh'
    )
    
    $stageNumber = 1
    $totalStages = $installCommands.Count
    
    foreach ($cmd in $installCommands) {
        Write-SubStep "Этап $stageNumber/${totalStages}: Установка Helm" -Status "RUNNING"
        
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
        if (-not $result -or $result.ExitCode -ne 0) {
            # Игнорируем ошибки репозиториев, так как они не критичны
            if ($cmd -like "*helm repo add*" -or $cmd -like "*helm repo update*") {
                Write-SubStep "Предупреждение при выполнении команды (не критично): $cmd" -Status "WARNING"
                Write-SubStep "Код ошибки: $($result.ExitCode)" -Status "WARNING"
                continue
            }
            
            Write-SubStep "Ошибка при установке Helm: $cmd" -Status "ERROR"
            Write-SubStep "Пробуем альтернативный способ установки..." -Status "WARNING"
            
            # Альтернативный способ установки
            $fallbackCommands = @(
                # Скачиваем напрямую с GitHub
                "curl -L https://get.helm.sh/helm-v$helmVersion-linux-amd64.tar.gz -o /tmp/helm.tar.gz",
                "tar -xzf /tmp/helm.tar.gz -C /tmp/",
                "sudo mv /tmp/linux-amd64/helm /usr/local/bin/helm",
                "sudo chmod +x /usr/local/bin/helm",
                "rm -rf /tmp/helm.tar.gz /tmp/linux-amd64",
                "helm version --short"
            )
            
            foreach ($fallbackCmd in $fallbackCommands) {
                $fallbackResult = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $fallbackCmd
                if (-not $fallbackResult -or $fallbackResult.ExitCode -ne 0) {
                    Write-SubStep "Альтернативная установка также не удалась" -Status "ERROR"
                    Write-Step "Установка Helm прервана" -Status "WARNING"
                    return $false
                }
            }
            break
        }
        
        $stageNumber++
    }
    
    # Финальная проверка
    Write-SubStep "Проверка установки Helm" -Status "RUNNING"
    $checkCommands = @(
        "echo '=== ПРОВЕРКА HELM ==='",
        "helm version --short",
        "echo ''",
        "echo 'Репозитории Helm:'",
        "helm repo list",
        "echo ''",
        "echo 'Пример установки Bitnami через OCI:'",
        "echo '  helm install my-release oci://registry-1.docker.io/bitnamicharts/nginx'",
        "echo ''",
        "echo 'Доступные команды:'",
        "echo '  /usr/local/bin/check-helm.sh - проверка установки Helm'"
    )
    
    foreach ($cmd in $checkCommands) {
        Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
    }
    
    Write-Step "Установка Helm 3.17.0 на $Hostname" -Status "END"
    return $true
}

# Функция для установки Kompose 1.37.0 на master узел
function Install-Kompose {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Hostname
    )
    
    Write-Step "Установка Kompose 1.37.0 на $Hostname" -Status "START"
    
    $komposeVersion = "1.37.0"
    Write-SubStep "Скачивание и установка Kompose v$komposeVersion" -Status "RUNNING"
    
    # Команды для установки Kompose
    $installCommands = @(
        # Создаем временный каталог
        "mkdir -p /tmp/kompose-install",
        
        # Загружаем Kompose с GitHub
        "wget -q https://github.com/kubernetes/kompose/releases/download/v$komposeVersion/kompose-linux-amd64.tar.gz -O /tmp/kompose-install/kompose.tar.gz",
        
        # Распаковываем
        "tar -xzf /tmp/kompose-install/kompose.tar.gz -C /tmp/kompose-install/",
        
        # Устанавливаем бинарный файл
        "sudo install -m 0755 /tmp/kompose-install/kompose-linux-amd64 /usr/local/bin/kompose",
        
        # Проверяем установку
        "kompose version",
        
        # Очистка временных файлов
        "rm -rf /tmp/kompose-install",
        
        # Создаем скрипт проверки Kompose
        'echo "#!/bin/bash" | sudo tee /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"=== Проверка Kompose установки ===\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "kompose version && echo \"✓ Kompose установлен\" || echo \"✗ Kompose не установлен\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"Примеры использования Kompose:\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"  kompose convert -f docker-compose.yml          # Конвертация docker-compose в Kubernetes манифесты\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"  kompose convert -f docker-compose.yml -o k8s/  # Сохранение в каталог k8s/\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"  kompose up -f docker-compose.yml              # Развертывание напрямую в кластер\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"  kompose down -f docker-compose.yml            # Удаление развернутого приложения\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'echo "echo \"  kompose convert --chart                       # Создание Helm чарта\"" | sudo tee -a /usr/local/bin/check-kompose.sh > /dev/null',
        'sudo chmod +x /usr/local/bin/check-kompose.sh',
        
        # Создаем пример docker-compose.yml для тестирования
        'echo "# Пример docker-compose.yml для тестирования Kompose" | sudo tee /tmp/example-docker-compose.yml > /dev/null',
        'echo "version: \"3\"" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "services:" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "  web:" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "    image: nginx:alpine" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "    ports:" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "      - \"80:80\"" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "    volumes:" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "      - ./html:/usr/share/nginx/html" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "  redis:" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "    image: redis:alpine" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "    ports:" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        'echo "      - \"6379:6379\"" | sudo tee -a /tmp/example-docker-compose.yml > /dev/null',
        
        # Создаем тестовый скрипт для Kompose
        'echo "#!/bin/bash" | sudo tee /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "echo \"Тестирование Kompose...\"" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "echo \"1. Создаем тестовый каталог...\"" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "mkdir -p /tmp/kompose-test && cd /tmp/kompose-test" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "cp /tmp/example-docker-compose.yml ." | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "echo \"2. Конвертируем docker-compose.yml в Kubernetes манифесты...\"" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "kompose convert -f docker-compose.yml" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "echo \"3. Показываем созданные файлы...\"" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "ls -la" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "echo \"4. Очистка...\"" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "cd /tmp && rm -rf kompose-test" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'echo "echo \"Тестирование завершено!\"" | sudo tee -a /usr/local/bin/test-kompose.sh > /dev/null',
        'sudo chmod +x /usr/local/bin/test-kompose.sh'
    )
    
    $stageNumber = 1
    $totalStages = $installCommands.Count
    
    foreach ($cmd in $installCommands) {
        Write-SubStep "Этап $stageNumber/${totalStages}: Установка Kompose" -Status "RUNNING"
        
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
        if (-not $result -or $result.ExitCode -ne 0) {
            Write-SubStep "Ошибка при установке Kompose: $cmd" -Status "ERROR"
            Write-SubStep "Пробуем альтернативный способ установки..." -Status "WARNING"
            
            # Альтернативный способ установки
            $fallbackCommands = @(
                # Скачиваем напрямую с GitHub
                "curl -L https://github.com/kubernetes/kompose/releases/download/v$komposeVersion/kompose-linux-amd64 -o /tmp/kompose",
                "sudo install -m 0755 /tmp/kompose /usr/local/bin/kompose",
                "rm -f /tmp/kompose",
                "kompose version"
            )
            
            foreach ($fallbackCmd in $fallbackCommands) {
                $fallbackResult = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $fallbackCmd
                if (-not $fallbackResult -or $fallbackResult.ExitCode -ne 0) {
                    Write-SubStep "Альтернативная установка также не удалась" -Status "ERROR"
                    Write-Step "Установка Kompose прервана" -Status "WARNING"
                    return $false
                }
            }
            break
        }
        
        $stageNumber++
    }
    
    # Финальная проверка
    Write-SubStep "Проверка установки Kompose" -Status "RUNNING"
    $checkCommands = @(
        "echo '=== ПРОВЕРКА KOMPOSE ==='",
        "kompose version",
        "echo ''",
        "echo 'Доступные команды:'",
        "echo '  /usr/local/bin/check-kompose.sh - проверка установки Kompose'",
        "echo '  /usr/local/bin/test-kompose.sh  - тестирование Kompose'",
        "echo ''",
        "echo 'Пример использования:'",
        "echo '  kompose convert -f docker-compose.yml          # Конвертация в Kubernetes манифесты'",
        "echo '  kompose convert -f docker-compose.yml --chart  # Создание Helm чарта'",
        "echo '  kompose up -f docker-compose.yml              # Развертывание в кластер'",
        "echo '  kompose down -f docker-compose.yml            # Удаление из кластера'"
    )
    
    foreach ($cmd in $checkCommands) {
        Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
    }
    
    Write-Step "Установка Kompose 1.37.0 на $Hostname" -Status "END"
    return $true
}

# Установка базовых компонентов на всех узлах
function Install-BaseComponents {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Hostname,
        [string]$Role
    )
    
    Write-Step "Установка базовых компонентов на $Hostname ($Role)" -Status "START"
    
    # Команды для установки сгруппированы по этапам
    $installationStages = @(
        @{
            Name = "Настройка hostname и /etc/hosts"
            Commands = @(
                "sudo hostnamectl set-hostname $Hostname",
                "echo '192.168.137.20 uchaly-k8s-master01' | sudo tee -a /etc/hosts",
                "echo '192.168.137.21 uchaly-k8s-worker01' | sudo tee -a /etc/hosts",
                "echo '192.168.137.22 uchaly-k8s-worker02' | sudo tee -a /etc/hosts"
            )
        },
        @{
            Name = "Установка Containerd $ContainerdVersion"
            Commands = @(
                "wget -q https://github.com/containerd/containerd/releases/download/v$ContainerdVersion/containerd-$ContainerdVersion-linux-amd64.tar.gz -P /tmp/",
                "sudo tar Cxzvf /usr/local /tmp/containerd-$ContainerdVersion-linux-amd64.tar.gz",
                "sudo wget -q https://raw.githubusercontent.com/containerd/containerd/main/containerd.service -P /etc/systemd/system/",
                "sudo systemctl daemon-reload",
                "sudo systemctl enable --now containerd"
            )
        },
        @{
            Name = "Установка Runc $RuncVersion"
            Commands = @(
                "sudo wget -q https://github.com/opencontainers/runc/releases/download/v$RuncVersion/runc.amd64 -P /tmp/",
                "sudo install -m 755 /tmp/runc.amd64 /usr/local/sbin/runc"
            )
        },
        @{
            Name = "Установка CNI плагинов v$CNIPluginsVersion"
            Commands = @(
                "sudo wget -q https://github.com/containernetworking/plugins/releases/download/v$CNIPluginsVersion/cni-plugins-linux-amd64-v$CNIPluginsVersion.tgz -P /tmp/",
                "sudo mkdir -p /opt/cni/bin",
                "sudo tar Cxzvf /opt/cni/bin /tmp/cni-plugins-linux-amd64-v$CNIPluginsVersion.tgz"
            )
        },
        @{
            Name = "Установка crictl $CrictlVersion"
            Commands = @(
                "wget -q https://github.com/kubernetes-sigs/cri-tools/releases/download/v$CrictlVersion/crictl-v$CrictlVersion-linux-amd64.tar.gz -P /tmp/",
                "sudo tar zxvf /tmp/crictl-v$CrictlVersion-linux-amd64.tar.gz -C /usr/local/bin",
                "sudo rm -f /tmp/crictl-v$CrictlVersion-linux-amd64.tar.gz",
                # Создаем конфигурационный файл для crictl
                "sudo mkdir -p /etc/crictl",
                "echo 'runtime-endpoint: unix:///run/containerd/containerd.sock' | sudo tee /etc/crictl/config.toml > /dev/null",
                "echo 'image-endpoint: unix:///run/containerd/containerd.sock' | sudo tee -a /etc/crictl/config.toml > /dev/null",
                "echo 'timeout: 10' | sudo tee -a /etc/crictl/config.toml > /dev/null",
                "echo 'debug: false' | sudo tee -a /etc/crictl/config.toml > /dev/null",
                # Проверяем установку
                "crictl --version 2>/dev/null && echo '✓ crictl установлен' || echo '✗ crictl не установлен'"
            )
        },
        @{
            Name = "Настройка Containerd (SystemdCgroup)"
            Commands = @(
                # 1. Создаем директорию
                "sudo mkdir -p /etc/containerd",
                
                # 2. Генерируем чистый дефолтный конфиг
                "containerd config default | sudo tee /etc/containerd/config.toml > /dev/null",
                
                # 3. Включаем SystemdCgroup
                "sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml",
                
                # 4. Устанавливаем правильный pause образ для Kubernetes
                "sudo sed -i 's|sandbox = \""\.*\""|sandbox = \""registry.k8s.io/pause:3.10\""|g' /etc/containerd/config.toml",
                
                # 5. Финальная проверка (для логов)
                "grep 'SystemdCgroup' /etc/containerd/config.toml",
                "grep 'sandbox' /etc/containerd/config.toml",
                
                # 6. Перезапуск
                "sudo systemctl restart containerd"
            )
        },
        @{
            Name = "Настройка модулей ядра и sysctl"
            Commands = @(
                "sudo modprobe overlay",
                "sudo modprobe br_netfilter",
                "echo 'overlay' | sudo tee -a /etc/modules-load.d/containerd.conf",
                "echo 'br_netfilter' | sudo tee -a /etc/modules-load.d/containerd.conf",
                "echo 'net.bridge.bridge-nf-call-iptables = 1' | sudo tee -a /etc/sysctl.d/99-kubernetes-cri.conf",
                "echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-kubernetes-cri.conf",
                "echo 'net.bridge.bridge-nf-call-ip6tables = 1' | sudo tee -a /etc/sysctl.d/99-kubernetes-cri.conf",
                "sudo sysctl --system"
            )
        },
        @{
            Name = "Отключение systemd-resolved и настройка DNS"
            Commands = @(
                # Останавливаем и отключаем systemd-resolved
                "sudo systemctl stop systemd-resolved 2>/dev/null || true",
                "sudo systemctl disable systemd-resolved 2>/dev/null || true",
                "sudo systemctl mask systemd-resolved 2>/dev/null || true",
                
                # Удаляем symlink resolv.conf
                "sudo rm -f /etc/resolv.conf 2>/dev/null || true",
                
                # Создаем новый resolv.conf с публичными DNS
                "echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf",
                "echo 'nameserver 8.8.4.4' | sudo tee -a /etc/resolv.conf",
                "echo 'options timeout:2 attempts:3' | sudo tee -a /etc/resolv.conf",
                
                # Запрещаем systemd менять resolv.conf
                "sudo ln -sf /etc/resolv.conf /run/systemd/resolve/stub-resolv.conf 2>/dev/null || true",
                "sudo ln -sf /etc/resolv.conf /run/systemd/resolve/resolv.conf 2>/dev/null || true",
                
                # Проверяем
                "echo '=== Проверка DNS настройки ==='",
                "cat /etc/resolv.conf",
                "echo ''"
            )
        },
        @{
            Name = "Установка Kubernetes компонентов с GitHub"
            Commands = @(
                "sudo apt-get update",
                "echo 'Установка Kubernetes с GitHub...'",
                # Установка зависимостей
                "sudo apt-get install -y wget curl conntrack ebtables ethtool socat ipset ipvsadm",
                # Устанавливаем Kubernetes с GitHub
                "mkdir -p /tmp/k8s-install",
                "wget -q $KubernetesGitHubURL/v$KubernetesVersion/kubernetes-server-linux-amd64.tar.gz -O /tmp/k8s-install/kubernetes-server.tar.gz",
                "tar -xzf /tmp/k8s-install/kubernetes-server.tar.gz -C /tmp/k8s-install/",
                "sudo install -m 0755 /tmp/k8s-install/kubernetes/server/bin/kubelet /usr/local/bin/kubelet",
                "sudo install -m 0755 /tmp/k8s-install/kubernetes/server/bin/kubeadm /usr/local/bin/kubeadm",
                "sudo install -m 0755 /tmp/k8s-install/kubernetes/server/bin/kubectl /usr/local/bin/kubectl",
                # Очистка временных файлов
                "rm -rf /tmp/k8s-install"
            )
        },
        @{  
            Name = "Создание конфигурационного файла kubelet"
            Commands = @(
                # Создаем директории для kubelet
                'sudo mkdir -p /etc/kubernetes',
                'sudo mkdir -p /var/lib/kubelet',
                'sudo mkdir -p /etc/kubernetes/manifests',
                
                # Удаляем старый файл, если есть
                'sudo rm -f /etc/kubernetes/kubelet-config.yaml',
                
                # Создаем конфигурационный файл kubelet по схеме
                "echo 'apiVersion: kubelet.config.k8s.io/v1beta1' | sudo tee /etc/kubernetes/kubelet-config.yaml",
                "echo 'kind: KubeletConfiguration' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",  
                "echo | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'staticPodPath: /etc/kubernetes/manifests' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'clusterDNS:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '- 10.96.0.10' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'clusterDomain: cluster.local' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'cgroupDriver: systemd' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'failSwapOn: false' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'containerRuntimeEndpoint: unix:///run/containerd/containerd.sock' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'authentication:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  anonymous:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '    enabled: false' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  webhook:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '    cacheTTL: 0s' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '    enabled: true' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  x509:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '    clientCAFile: /etc/kubernetes/pki/ca.crt' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'authorization:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  mode: Webhook' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  webhook:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '    cacheAuthorizedTTL: 0s' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '    cacheUnauthorizedTTL: 0s' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'serializeImagePulls: false' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo 'evictionHard:' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  memory.available: 100Mi' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  nodefs.available: 10%' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  nodefs.inodesFree: 5%' | sudo tee -a /etc/kubernetes/kubelet-config.yaml",
                "echo '  imagefs.available: 15%' | sudo tee -a /etc/kubernetes/kubelet-config.yaml"
            )
        },
        @{
            Name = "Создание systemd сервиса для kubelet с использованием конфигурационного файла"
            Commands = @(
                # Создаем systemd сервис для kubelet с использованием конфигурационного файла
                'echo "[Unit]" | sudo tee /etc/systemd/system/kubelet.service > /dev/null',
                'echo "Description=Kubernetes Kubelet" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "Documentation=https://kubernetes.io/docs/home/" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "After=containerd.service" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "Requires=containerd.service" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo  | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "[Service]" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                "echo 'ExecStart=/usr/local/bin/kubelet \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --config=/etc/kubernetes/kubelet-config.yaml \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --kubeconfig=/etc/kubernetes/kubelet.conf \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --bootstrap-kubeconfig=/etc/kubernetes/bootstrap-kubelet.conf \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --container-runtime-endpoint=unix:///run/containerd/containerd.sock \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --cgroup-driver=systemd \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null", 
                "echo '  --pod-infra-container-image=registry.k8s.io/pause:3.10 \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --node-ip=$IP \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --hostname-override=$Hostname \' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                "echo '  --v=2' | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null",
                'echo "Restart=always" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "StartLimitInterval=0" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "RestartSec=10" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo  | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "[Install]" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                'echo "WantedBy=multi-user.target" | sudo tee -a /etc/systemd/system/kubelet.service > /dev/null',
                
                # Проверяем созданные файлы
                "echo '=== Проверка созданных файлов ==='",
                "sudo cat /etc/kubernetes/kubelet-config.yaml | head -20",
                "echo ''",
                "sudo cat /etc/systemd/system/kubelet.service | head -15"
            )
        },
        @{
            Name = "Отключение swap"
            Commands = @(
                "sudo swapoff -a",
                "sudo sed -i '/swap/ s/^\([^#]\)/#\1/' /etc/fstab"
            )
        }
    )
    
    # Добавляем этап запуска kubelet в зависимости от роли
    if ($Role -eq "master") {
        $installationStages += @{
            Name = "Активация и запуск kubelet (только для master)"
            Commands = @(
                "sudo systemctl daemon-reload",
                "sudo systemctl enable kubelet",
                "sudo systemctl start kubelet",
                "sleep 3",
                "sudo systemctl status kubelet --no-pager | head -10"
            )
        }
    } else {
        $installationStages += @{
            Name = "Активация kubelet без запуска (для worker)"
            Commands = @(
                "sudo systemctl daemon-reload",
                "sudo systemctl enable kubelet"
                # НЕ запускаем kubelet на worker узлах до join
            )
        }
    }
    
    $installationStages += @{
        Name = "Создание скрипта проверки"
        Commands = @(
            'echo "#!/bin/bash" | sudo tee /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"=== Проверка установки Kubernetes компонентов ===\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"1. Containerd:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "containerd --version 2>/dev/null || echo \"Не установлен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"2. Runc:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "runc --version 2>/dev/null || echo \"Не установлен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"3. CNI Plugins:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "ls -la /opt/cni/bin/ 2>/dev/null | head -5" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"4. crictl:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "crictl --version 2>/dev/null && echo \"✓ crictl установлен\" || echo \"✗ crictл не установлен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"5. Kubelet:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "kubelet --version 2>/dev/null || echo \"Не установлен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"6. Kubeadm:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "kubeadm version 2>/dev/null || echo \"Не установлен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"7. Kubectl:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "kubectl version --client 2>/dev/null | head -1 || echo \"Не установлен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"8. Проверка сервисов:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "sudo systemctl is-active containerd 2>/dev/null && echo \"Containerd: активен\" || echo \"Containerd: не активен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "sudo systemctl is-active kubelet 2>/dev/null && echo \"Kubelet: активен\" || echo \"Kubelet: не активен\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "echo \"9. Конфигурация kubelet:\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'echo "sudo grep -E \"(cgroupDriver|containerRuntimeEndpoint|sandbox)\" /etc/kubernetes/kubelet-config.yaml /etc/containerd/config.toml 2>/dev/null || echo \"Конфигурационные файлы не найдены\"" | sudo tee -a /usr/local/bin/check-k8s-install.sh > /dev/null',
            'sudo chmod +x /usr/local/bin/check-k8s-install.sh',
            'echo "Скрипт проверки создан: /usr/local/bin/check-k8s-install.sh"'
        )
    }
    
    # Выполняем все этапы
    $stageNumber = 1
    $totalStages = $installationStages.Count
    
    foreach ($stage in $installationStages) {
        Write-SubStep "Этап $stageNumber/${totalStages}: $($stage.Name)" -Status "RUNNING"
        
        foreach ($cmd in $stage.Commands) {
            $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
            if (-not $result -or $result.ExitCode -ne 0) {
                Write-SubStep "Ошибка на этапе: $($stage.Name)" -Status "ERROR"
                Write-SubStep "Команда: $cmd" -Status "ERROR"
                
                # Если это этап установки Kubernetes, пробуем альтернативный способ
                if ($stage.Name -eq "Установка Kubernetes компонентов с GitHub") {
                    Write-SubStep "Пробуем альтернативную установку с GitHub..." -Status "WARNING"
                    $fallbackSuccess = Install-KubernetesFromGitHub -IP $IP -User $User -Pass $Pass -Hostname $Hostname
                    if ($fallbackSuccess) {
                        Write-SubStep "Установка с GitHub успешна" -Status "SUCCESS"
                        continue
                    }
                }
                
                Write-Step "Установка компонентов на $Hostname прервана" -Status "ERROR"
                return $false
            }
        }
        
        Write-SubStep "Этап $stageNumber/$totalStages завершен: $($stage.Name)" -Status "SUCCESS"
        $stageNumber++
    }
    
    # Финальная проверка установки
    Write-SubStep "Финальная проверка установки" -Status "RUNNING"
    $checkCommands = @(
        "echo '=== ФИНАЛЬНАЯ ПРОВЕРКА УСТАНОВКИ ==='",
        "echo '1. Проверка сервисов:'",
        "sudo systemctl is-active containerd && echo '✓ Containerd запущен' || echo '✗ Containerd не запущен'",
        "echo ''",
        "echo '2. Проверка версий:'",
        "containerd --version 2>/dev/null && echo '✓ Containerd установлен' || echo '✗ Containerd не установлен'",
        "kubelet --version 2>/dev/null && echo '✓ Kubelet установлен' || echo '✗ Kubelet не установлен'",
        "kubeadm version 2>/dev/null && echo '✓ Kubeadm установлен' || echo '✗ Kubeadm не установлен'",
        "echo ''",
        "echo '3. Проверка crictl:'",
        "crictl --version 2>/dev/null && echo '✓ crictl установлен' || echo '✗ crictl не установлен'",
        "echo ''",
        "echo '4. Проверка конфигурации:'",
        "sudo grep 'SystemdCgroup' /etc/containerd/config.toml && echo '✓ Containerd: SystemdCgroup включен' || echo '✗ Containerd: SystemdCgroup не найден'",
        "sudo grep 'cgroupDriver: systemd' /etc/kubernetes/kubelet-config.yaml && echo '✓ Kubelet: cgroupDriver = systemd' || echo '✗ Kubelet: cgroupDriver не настроен'",
        "sudo grep 'containerRuntimeEndpoint' /etc/kubernetes/kubelet-config.yaml && echo '✓ Kubelet: containerRuntimeEndpoint настроен' || echo '✗ Kubelet: containerRuntimeEndpoint не настроен'",
        "echo ''",
        "echo '5. Проверка DNS:'",
        "cat /etc/resolv.conf",
        "echo ''",
        "echo '6. Проверка systemd-resolved:'",
        "systemctl is-active systemd-resolved 2>/dev/null && echo '⚠ systemd-resolved активен (рекомендуется отключить)' || echo '✓ systemd-resolved отключен'"
    )
    
    foreach ($cmd in $checkCommands) {
        Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
    }
    
    Write-Step "Установка базовых компонентов на $Hostname" -Status "END"
    return $true
}

# Инициализация кластера на master узле
function Initialize-KubernetesCluster {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Hostname
    )
    
    Write-Step "Инициализация Kubernetes кластера на $Hostname" -Status "START"
    
    # Этапы инициализации кластера
    $initStages = @(
        @{
            Name = "Инициализация кластера kubeadm"
            Command = "sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --kubernetes-version=v$KubernetesVersion --node-name=$Hostname --ignore-preflight-errors=Swap"
            Critical = $true
        },
        @{
            Name = "Настройка доступа к кластеру"
            Commands = @(
                "mkdir -p `$HOME/.kube",
                "sudo cp -i /etc/kubernetes/admin.conf `$HOME/.kube/config",
                "sudo chown `$(id -u):`$(id -g) `$HOME/.kube/config"
            )
            Critical = $true
        },
        @{
            Name = "Установка Calico CNI $CalicoVersion"
            Commands = @(
                "kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v$CalicoVersion/manifests/tigera-operator.yaml",
                "sleep 15", # Даем время оператору запуститься
                # Создаем конфигурацию Calico через echo
                "echo 'apiVersion: operator.tigera.io/v1' > /tmp/calico-custom-resources.yaml",
                "echo 'kind: Installation' >> /tmp/calico-custom-resources.yaml",
                "echo 'metadata:' >> /tmp/calico-custom-resources.yaml",
                "echo '  name: default' >> /tmp/calico-custom-resources.yaml",
                "echo 'spec:' >> /tmp/calico-custom-resources.yaml",
                "echo '  calicoNetwork:' >> /tmp/calico-custom-resources.yaml",
                "echo '    ipPools:' >> /tmp/calico-custom-resources.yaml",
                "echo '    - blockSize: 26' >> /tmp/calico-custom-resources.yaml",
                "echo '      cidr: 10.244.0.0/16' >> /tmp/calico-custom-resources.yaml",
                "echo '      encapsulation: VXLANCrossSubnet' >> /tmp/calico-custom-resources.yaml",
                "echo '      natOutgoing: Enabled' >> /tmp/calico-custom-resources.yaml",
                "echo '      nodeSelector: all()' >> /tmp/calico-custom-resources.yaml",
                "echo '' >> /tmp/calico-custom-resources.yaml",
                "echo '---' >> /tmp/calico-custom-resources.yaml",
                "echo '' >> /tmp/calico-custom-resources.yaml",
                "echo 'apiVersion: operator.tigera.io/v1' >> /tmp/calico-custom-resources.yaml",
                "echo 'kind: APIServer' >> /tmp/calico-custom-resources.yaml",
                "echo 'metadata:' >> /tmp/calico-custom-resources.yaml",
                "echo '  name: default' >> /tmp/calico-custom-resources.yaml",
                "echo 'spec: {}' >> /tmp/calico-custom-resources.yaml",
                "sleep 15",
                # Применяем с проверкой
                "kubectl apply -f /tmp/calico-custom-resources.yaml",
                "sleep 15"
            )
            Critical = $true
        },
        @{
            Name = "Ожидание запуска Calico"
            Command = "sleep 30"
            Critical = $false
        },
        @{
            Name = "Снятие taint с master узла"
            Command = "kubectl taint nodes --all node-role.kubernetes.io/control-plane-"
            Critical = $false
        },
        @{
            Name = "Генерация команды для присоединения worker узлов"
            Command = "kubeadm token create --print-join-command > /tmp/join-command.sh && chmod +x /tmp/join-command.sh"
            Critical = $true
        }
    )
    
    $stageNumber = 1
    $totalStages = $initStages.Count
    $joinCommand = ""
    
    foreach ($stage in $initStages) {
        Write-SubStep "Этап $stageNumber/${totalStages}: $($stage.Name)" -Status "RUNNING"
        
        if ($stage.Command) {
            $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $stage.Command -StepName $stage.Name
            if (-not $result) {
                if ($stage.Critical) {
                    Write-Step "Инициализация кластера прервана на этапе: $($stage.Name)" -Status "ERROR"
                    return $null
                } else {
                    Write-SubStep "Не критическая ошибка на этапе: $($stage.Name)" -Status "WARNING"
                }
            }
            
            # Ищем команду join в выводе
            if ($stage.Name -eq "Генерация команды для присоединения worker узлов" -and $result -and $result.Output) {
                $lines = $result.Output -split "`n"
                foreach ($line in $lines) {
                    if ($line -like "kubeadm join*") {
                        $joinCommand = $line.Trim()
                        break
                    }
                }
            }
        } elseif ($stage.Commands) {
            $partNumber = 1
            foreach ($cmd in $stage.Commands) {
                $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd -StepName "$($stage.Name) - часть $partNumber"
                $partNumber++
                if (-not $result -and $stage.Critical) {
                    Write-Step "Инициализация кластера прервана на этапе: $($stage.Name)" -Status "ERROR"
                    return $null
                }
            }
        }
        
        Write-SubStep "Этап $stageNumber/$totalStages завершен: $($stage.Name)" -Status "SUCCESS"
        $stageNumber++
    }
    
    # Проверка состояния кластера
    Write-SubStep "Проверка состояния кластера" -Status "RUNNING"
    $checkCommands = @(
        "echo '=== Узлы кластера ==='",
        "kubectl get nodes",
        "echo ''",
        "echo '=== Поды в kube-system ==='",
        "kubectl get pods -n kube-system",
        "echo ''",
        "echo '=== Поды в calico-system ==='",
        "kubectl get pods -n calico-system"
    )
    
    foreach ($cmd in $checkCommands) {
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
    }
    
    # Получение команды join если не найдена ранее
    if (-not $joinCommand) {
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command "cat /tmp/join-command.sh 2>/dev/null || echo 'NOT_FOUND'"
        if ($result -and $result.Output -notlike "*NOT_FOUND*") {
            $joinCommand = $result.Output.Trim()
        }
    }
    
    if ($joinCommand) {
        Write-Step "Инициализация Kubernetes кластера на $Hostname" -Status "END"
        Write-Host "`n[ВАЖНО] Команда для присоединения worker узлов:" -ForegroundColor Yellow
        Write-Host "$joinCommand" -ForegroundColor White
        Write-Host "`nСкопируйте эту команду для присоединения worker узлов." -ForegroundColor Cyan
        return $joinCommand
    } else {
        Write-Step "Инициализация кластера завершена, но не удалось получить команду join" -Status "WARNING"
        return ""
    }
}

# Присоединение worker узлов к кластеру
function Join-WorkerNode {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass,
        [string]$Hostname,
        [string]$JoinCommand
    )
    
    Write-Step "Присоединение worker узла $Hostname к кластеру" -Status "START"
    
    # Предварительная очистка и подготовка
    Write-SubStep "Подготовка worker узла перед join" -Status "RUNNING"
    
    $preparationCommands = @(
        # Останавливаем kubelet если он запущен
        "sudo systemctl stop kubelet 2>/dev/null || true",
        
        # Удаляем старые конфигурационные файлы, которые могли остаться
        "sudo rm -f /etc/kubernetes/kubelet.conf 2>/dev/null || true",
        "sudo rm -f /etc/kubernetes/bootstrap-kubelet.conf 2>/dev/null || true",
        "sudo rm -f /var/lib/kubelet/config.yaml 2>/dev/null || true",
        "sudo rm -f /var/lib/kubelet/kubeadm-flags.env 2>/dev/null || true",
        
        # Сбрасываем состояние systemd
        "sudo systemctl reset-failed kubelet 2>/dev/null || true",
        "sudo systemctl daemon-reload",
        
        # Проверяем containerd
        "sudo systemctl restart containerd",
        "sleep 3",
        
        # Проверяем, что containerd работает
        "sudo systemctl is-active containerd && echo '✓ Containerd активен' || echo '✗ Containerd не активен'"
    )
    
    foreach ($cmd in $preparationCommands) {
        Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
    }
    
    $joinStages = @(
        @{
            Name = "Выполнение команды join с флагом ignore-preflight-errors"
            Command = "sudo $JoinCommand --ignore-preflight-errors=all"
            Critical = $true
        },
        @{
            Name = "Ожидание запуска kubelet"
            Commands = @(
                "sleep 10",
                "echo '=== Проверка статуса kubelet ==='",
                "sudo systemctl status kubelet --no-pager | head -15 || true"
            )
            Critical = $false
        },
        @{
            Name = "Проверка логов kubelet"
            Command = "sudo journalctl -u kubelet --no-pager -n 20 | tail -20"
            Critical = $false
        }
    )
    
    $stageNumber = 1
    $totalStages = $joinStages.Count
    
    foreach ($stage in $joinStages) {
        Write-SubStep "Этап $stageNumber/${totalStages}: $($stage.Name)" -Status "RUNNING"
        
        if ($stage.Command) {
            $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $stage.Command -StepName $stage.Name
        } elseif ($stage.Commands) {
            foreach ($cmd in $stage.Commands) {
                $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
            }
        }
        
        if ($stage.Critical -and (-not $result -or $result.ExitCode -ne 0)) {
            # При критической ошибке пытаемся диагностировать проблему
            Write-SubStep "Диагностика проблемы на узле $Hostname" -Status "ERROR"
            
            $diagnosticCommands = @(
                "echo '=== ДИАГНОСТИКА ПРОБЛЕМ KUBELET ==='",
                "echo '1. Статус kubelet:'",
                "sudo systemctl status kubelet --no-pager",
                "echo ''",
                "echo '2. Последние логи kubelet:'",
                "sudo journalctl -u kubelet --no-pager -n 50",
                "echo ''",
                "echo '3. Проверка containerd:'",
                "sudo systemctl status containerd --no-pager",
                "echo ''",
                "echo '4. Проверка сокета containerd:'",
                "sudo ls -la /run/containerd/containerd.sock",
                "echo ''",
                "echo '5. Проверка конфигурации:'",
                "sudo grep -E '(cgroupDriver|containerRuntimeEndpoint)' /etc/kubernetes/kubelet-config.yaml",
                "sudo grep 'SystemdCgroup' /etc/containerd/config.toml",
                "echo ''",
                "echo '6. Проверка портов:'",
                "sudo ss -tlnp | grep -E '(10250|10248)' || echo 'Порты kubelet не слушаются'"
            )
            
            foreach ($cmd in $diagnosticCommands) {
                Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
            }
            
            Write-Step "Присоединение узла $Hostname прервано" -Status "ERROR"
            return $false
        }
        
        Write-SubStep "Этап $stageNumber/$totalStages завершен: $($stage.Name)" -Status "SUCCESS"
        $stageNumber++
    }
    
    Write-Step "Присоединение worker узла $Hostname к кластеру" -Status "END"
    return $true
}

# Проверка состояния кластера
function Check-ClusterStatus {
    param(
        [string]$IP,
        [string]$User,
        [string]$Pass
    )
    
    Write-Step "Финальная проверка состояния кластера" -Status "START"
    
    $checkCommands = @(
        "echo '=== СВОДКА КЛАСТЕРА ==='",
        "echo ''",
        "echo '1. Узлы кластера:'",
        "kubectl get nodes",
        "echo ''",
        "echo '2. Все поды:'",
        "kubectl get pods --all-namespaces | head -20",
        "echo ''",
        "echo '3. Системные поды:'",
        "kubectl get pods -n kube-system",
        "echo ''",
        "echo '4. Calico поды:'",
        "kubectl get pods -n calico-system",
        "echo ''",
        "echo '5. Версия кластера:'",
        "kubectl version --short 2>/dev/null || echo 'Не удалось получить версию'"
    )
    
    $stageNumber = 1
    $totalStages = $checkCommands.Count
    
    foreach ($cmd in $checkCommands) {
        Write-SubStep "Этап $stageNumber/${totalStages}: Проверка состояния" -Status "RUNNING"
        
        $result = Invoke-PlinkCommand -IP $IP -User $User -Pass $Pass -Command $cmd
        if ($result -and $result.Output) {
            Write-Host "  $($result.Output)" -ForegroundColor Gray
        }
        
        $stageNumber++
    }
    
    Write-Step "Проверка состояния кластера завершена" -Status "END"
    return $true
}

# Главная функция установки
function Install-Kubernetes {
    Write-Host "`n"
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host "   УСТАНОВКА KUBERNETES КЛАСТЕРА v1.33.4   " -ForegroundColor Cyan
    Write-Host "===========================================" -ForegroundColor Cyan
    Write-Host "`n"
    
    Write-Host "Конфигурация установки:" -ForegroundColor Yellow
    Write-Host "  Kubernetes: $KubernetesVersion" -ForegroundColor Gray
    Write-Host "  Containerd: $ContainerdVersion" -ForegroundColor Gray
    Write-Host "  Runc: $RuncVersion" -ForegroundColor Gray
    Write-Host "  CNI Plugins: $CNIPluginsVersion" -ForegroundColor Gray
    Write-Host "  crictl: $CrictlVersion" -ForegroundColor Gray 
    Write-Host "  Calico CNI: $CalicoVersion" -ForegroundColor Gray
    Write-Host "  Helm: $HelmVersion (с поддержкой OCI для Bitnami)" -ForegroundColor Gray
    Write-Host "  Kompose: $KomposeVersion (для конвертации Docker Compose)" -ForegroundColor Gray
    Write-Host "`n"
    
    Write-Host "Примечание: Компоненты Kubernetes будут загружены с GitHub." -ForegroundColor Yellow
    Write-Host "`n"
    
    # Рассчитываем общее количество этапов
    $global:TotalSteps = 0
    $global:TotalSteps += 1  # Проверка доступности узлов
    $global:TotalSteps += $vmIPs.Count  # Установка на каждый узел
    $global:TotalSteps += 1  # Перезагрузка (опционально)
    $global:TotalSteps += 1  # Инициализация кластера
    $global:TotalSteps += 1  # Установка Helm
    $global:TotalSteps += 1  # Установка Kompose
    $global:TotalSteps += ($vmIPs | Where-Object { $_.Role -eq "worker" }).Count  # Присоединение worker
    $global:TotalSteps += 1  # Проверка кластера
    $global:TotalSteps += 1  # Создание скрипта проверки
    
    Write-Host "Всего этапов установки: $global:TotalSteps" -ForegroundColor Cyan
    Write-Host "Начало установки: $(Get-Date -Format 'HH:mm:ss')`n" -ForegroundColor Gray
    
    # Этап 1: Проверка доступности узлов
    Write-Step "Проверка доступности всех узлов" -Status "START"
    
    $availableNodes = @()
    foreach ($vm in $vmIPs) {
        Write-SubStep "Проверка подключения к $($vm.Hostname) ($($vm.IP))" -Status "RUNNING"
        
        if (Test-SSHConnection -IP $vm.IP -User $Username -Pass $Password) {
            Write-SubStep "$($vm.Hostname) доступен" -Status "SUCCESS"
            $availableNodes += $vm
        } else {
            Write-SubStep "$($vm.Hostname) недоступен" -Status "ERROR"
        }
    }
    
    if ($availableNodes.Count -eq 0) {
        Write-Step "Нет доступных узлов для установки" -Status "ERROR"
        return
    }
    
    Write-Step "Проверка доступности всех узлов" -Status "END"
    
    # Разделение узлов по ролям
    $masterNode = $availableNodes | Where-Object { $_.Role -eq "master" } | Select-Object -First 1
    $workerNodes = $availableNodes | Where-Object { $_.Role -eq "worker" }
    
    if (-not $masterNode) {
        Write-Step "Не найден master узел для инициализации кластера" -Status "ERROR"
        return
    }
    
    Write-Host "`nНайденные узлы:" -ForegroundColor Yellow
    Write-Host "  Master: $($masterNode.Hostname) ($($masterNode.IP))" -ForegroundColor Green
    foreach ($worker in $workerNodes) {
        Write-Host "  Worker: $($worker.Hostname) ($($worker.IP))" -ForegroundColor Yellow
    }
    Write-Host "" -ForegroundColor Yellow
    
    # Этап 2: Установка базовых компонентов на всех узлах
    Write-Step "Установка базовых компонентов на всех узлах" -Status "START"
    
    $allNodesSuccess = $true
    $nodeIndex = 1
    foreach ($vm in $availableNodes) {
        Write-Host "`n[Узел $nodeIndex/$($availableNodes.Count)] Установка на $($vm.Hostname) ($($vm.Role))" -ForegroundColor Magenta
        
        $success = Install-BaseComponents -IP $vm.IP -User $Username -Pass $Password -Hostname $vm.Hostname -Role $vm.Role
        if (-not $success) {
            $allNodesSuccess = $false
            Write-Step "Установка прервана из-за ошибок" -Status "ERROR"
            break
        }
        $nodeIndex++
    }
    
    if (-not $allNodesSuccess) {
        return
    }
    
    Write-Step "Установка базовых компонентов на всех узлах" -Status "END"
    
    # Дополнительно: Отключение systemd-resolved на всех узлах
    Write-Step "Дополнительная проверка отключения systemd-resolved" -Status "START"
    foreach ($vm in $availableNodes) {
        Write-SubStep "Проверка systemd-resolved на $($vm.Hostname)" -Status "RUNNING"
        $result = Invoke-PlinkCommand -IP $vm.IP -User $Username -Pass $Password -Command "systemctl is-active systemd-resolved 2>/dev/null && echo 'WARNING: systemd-resolved активен' || echo 'OK: systemd-resolved отключен'"
        if ($result -and $result.Output -like "*активен*") {
            Write-SubStep "$($vm.Hostname): systemd-resolved все еще активен, отключаем..." -Status "WARNING"
            Disable-SystemdResolved -IP $vm.IP -User $Username -Pass $Password
        }
    }
    Write-Step "Дополнительная проверка отключения systemd-resolved" -Status "END"
    
    # Этап 3: Опциональная перезагрузка
    Write-Step "Опциональная перезагрузка узлов" -Status "START"
    
    $choice = Read-Host "`nПерезагрузить узлы для применения изменений ядра? (Y/N)"
    if ($choice -eq 'Y' -or $choice -eq 'y') {
        Write-SubStep "Перезагрузка всех узлов" -Status "RUNNING"
        
        foreach ($vm in $availableNodes) {
            Write-SubStep "Перезагрузка $($vm.Hostname)" -Status "RUNNING"
            $result = Invoke-PlinkCommand -IP $vm.IP -User $Username -Pass $Password -Command "sudo reboot"
            Start-Sleep -Seconds 3
        }
        
        Write-SubStep "Ожидание перезагрузки (90 секунд)" -Status "RUNNING"
        Start-Sleep -Seconds 90
        
        Write-SubStep "Проверка доступности после перезагрузки" -Status "RUNNING"
        
        $reconnectedNodes = @()
        foreach ($vm in $availableNodes) {
            $retryCount = 0
            $maxRetries = 10
            $connected = $false
            
            while ($retryCount -lt $maxRetries -and -not $connected) {
                Write-SubStep "Попытка $($retryCount + 1)/$maxRetries подключения к $($vm.Hostname)" -Status "RUNNING"
                $connected = Test-SSHConnection -IP $vm.IP -User $Username -Pass $Password
                if ($connected) {
                    Write-SubStep "$($vm.Hostname) доступен после перезагрузки" -Status "SUCCESS"
                    $reconnectedNodes += $vm
                } else {
                    Start-Sleep -Seconds 10
                    $retryCount++
                }
            }
            
            if (-not $connected) {
                Write-SubStep "Не удалось подключиться к $($vm.Hostname) после перезагрузки" -Status "ERROR"
            }
        }
        
        if ($reconnectedNodes.Count -ne $availableNodes.Count) {
            Write-SubStep "Не все узлы доступны после перезагрузки" -Status "WARNING"
        }
    } else {
        Write-SubStep "Перезагрузка пропущена" -Status "WARNING"
    }
    
    Write-Step "Опциональная перезагрузка узлов" -Status "END"
    
    # Этап 4: Инициализация кластера на master
    Write-Step "Инициализация Kubernetes кластера на master узле" -Status "START"
    
    $joinCommand = Initialize-KubernetesCluster -IP $masterNode.IP -User $Username -Pass $Password -Hostname $masterNode.Hostname
    
    if (-not $joinCommand) {
        Write-Step "Не удалось получить команду join, попытка получить из файла" -Status "WARNING"
        $result = Invoke-PlinkCommand -IP $masterNode.IP -User $Username -Pass $Password -Command "cat /tmp/join-command.sh 2>/dev/null || echo 'NOT_FOUND'"
        if ($result -and $result.Output -notlike "*NOT_FOUND*") {
            $joinCommand = $result.Output.Trim()
            Write-SubStep "Команда join получена из файла" -Status "SUCCESS"
        } else {
            Write-Step "Инициализация кластера не удалась" -Status "ERROR"
            return
        }
    }
    
    Write-Step "Инициализация Kubernetes кластера на master узле" -Status "END"
    
    # Этап 5: Установка Helm на master узел
    Write-Step "Установка Helm 3.17.0 на master узел" -Status "START"
    
    $helmInstalled = Install-Helm -IP $masterNode.IP -User $Username -Pass $Password -Hostname $masterNode.Hostname
    if ($helmInstalled) {
        Write-Step "Установка Helm 3.17.0 на master узел" -Status "END"
    } else {
        Write-Step "Установка Helm не удалась, но установка кластера продолжается" -Status "WARNING"
    }
    
    # Этап 6: Установка Kompose на master узел
    Write-Step "Установка Kompose 1.37.0 на master узел" -Status "START"
    
    $komposeInstalled = Install-Kompose -IP $masterNode.IP -User $Username -Pass $Password -Hostname $masterNode.Hostname
    if ($komposeInstalled) {
        Write-Step "Установка Kompose 1.37.0 на master узел" -Status "END"
    } else {
        Write-Step "Установка Kompose не удалась, но установка кластера продолжается" -Status "WARNING"
    }
    
    # Этап 7: Присоединение worker узлов
    if ($workerNodes.Count -gt 0) {
        Write-Step "Присоединение worker узлов к кластеру" -Status "START"
        
        $workerIndex = 1
        foreach ($worker in $workerNodes) {
            Write-Host "`n[Worker $workerIndex/$($workerNodes.Count)] Присоединение $($worker.Hostname)" -ForegroundColor Magenta
            
            $success = Join-WorkerNode -IP $worker.IP -User $Username -Pass $Password -Hostname $worker.Hostname -JoinCommand $joinCommand
            
            if (-not $success) {
                Write-SubStep "Повторная попытка присоединения $($worker.Hostname)" -Status "WARNING"
                $success = Join-WorkerNode -IP $worker.IP -User $Username -Pass $Password -Hostname $worker.Hostname -JoinCommand $joinCommand
                
                if (-not $success) {
                    Write-SubStep "Не удалось присоединить узел $($worker.Hostname)" -Status "ERROR"
                }
            }
            $workerIndex++
        }
        
        Write-Step "Присоединение worker узлов к кластеру" -Status "END"
    }
    
    # Этап 8: Ожидание стабилизации кластера
    Write-Step "Ожидание стабилизации кластера" -Status "START"
    Write-SubStep "Ожидание 30 секунд для стабилизации" -Status "RUNNING"
    Start-Sleep -Seconds 30
    Write-Step "Ожидание стабилизации кластера" -Status "END"
    
    # Этап 9: Финальная проверка
    Check-ClusterStatus -IP $masterNode.IP -User $Username -Pass $Password
    
    # Этап 10: Создание скрипта проверки
    Write-Step "Создание скрипта для проверки установки" -Status "START"
    
    $checkScript = @'
# Скрипт для проверки установки Kubernetes
Write-Host "=== ПРОВЕРКА УСТАНОВКИ KUBERNETES ===" -ForegroundColor Cyan
Write-Host "Запуск: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

$nodes = @(
    @{IP = "192.168.137.20"; Hostname = "uchaly-k8s-master01"},
    @{IP = "192.168.137.21"; Hostname = "uchaly-k8s-worker01"},
    @{IP = "192.168.137.22"; Hostname = "uchaly-k8s-worker02"}
)

$totalChecks = 0
$passedChecks = 0

foreach ($node in $nodes) {
    Write-Host "`n[УЗЕЛ] $($node.Hostname) ($($node.IP))" -ForegroundColor Yellow
    
    # Проверка SSH доступности
    try {
        $totalChecks++
        $connection = Test-NetConnection -ComputerName $node.IP -Port 22 -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "  ✓ SSH доступен" -ForegroundColor Green
            $passedChecks++
            
            # Выполнение команды проверки
            $plinkPath = Get-Command plink.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
            if (-not $plinkPath) {
                $plinkPath = "${env:ProgramFiles}\PuTTY\plink.exe"
            }
            
            if (Test-Path $plinkPath) {
                $result = & $plinkPath -ssh $node.IP -l admin -pw P@ssw0rd123 -batch "sudo /usr/local/bin/check-k8s-install.sh"
                Write-Host "  Результат проверки:" -ForegroundColor Gray
                $result -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
                
                # Добавляем проверку Helm и Kompose только для master узла
                if ($node.Hostname -eq "uchaly-k8s-master01") {
                    $helmResult = & $plinkPath -ssh $node.IP -l admin -pw P@ssw0rd123 -batch "sudo /usr/local/bin/check-helm.sh 2>/dev/null || echo 'Helm не установлен'" 
                    Write-Host "  Проверка Helm:" -ForegroundColor Gray
                    $helmResult -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
                    
                    $komposeResult = & $plinkPath -ssh $node.IP -l admin -pw P@ssw0rd123 -batch "sudo /usr/local/bin/check-kompose.sh 2>/dev/null || echo 'Kompose не установлен'" 
                    Write-Host "  Проверка Kompose:" -ForegroundColor Gray
                    $komposeResult -split "`n" | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
                }
            } else {
                Write-Host "  ⚠ Plink не найден" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ✗ SSH недоступен" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ✗ Ошибка подключения: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== ИТОГИ ПРОВЕРКИ ===" -ForegroundColor Cyan
Write-Host "Проверок выполнено: $passedChecks/$totalChecks" -ForegroundColor $(if ($passedChecks -eq $totalChecks) { "Green" } else { "Yellow" })
Write-Host "Проверка завершена: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
'@
    
    $checkScriptPath = ".\Check-K8s-Install.ps1"
    $checkScript | Out-File -FilePath $checkScriptPath -Encoding UTF8
    
    Write-SubStep "Скрипт создан: $checkScriptPath" -Status "SUCCESS"
    Write-Step "Создание скрипта для проверки установки" -Status "END"
    
    # Вывод итоговой информации
    $endTime = Get-Date
    $duration = $endTime - $global:StartTime
    
    Write-Host "`n"
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "   УСТАНОВКА УСПЕШНО ЗАВЕРШЕНА!           " -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "`n"
    
    Write-Host "Сводка установки:" -ForegroundColor Yellow
    Write-Host "  Начало: $($global:StartTime.ToString('HH:mm:ss'))" -ForegroundColor Gray
    Write-Host "  Завершение: $($endTime.ToString('HH:mm:ss'))" -ForegroundColor Gray
    Write-Host "  Продолжительность: $($duration.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
    Write-Host "  Всего этапов: $global:TotalSteps" -ForegroundColor Gray
    Write-Host "  Выполнено этапов: $global:CurrentStep" -ForegroundColor Gray
    Write-Host "  Узлов обработано: $($availableNodes.Count)" -ForegroundColor Gray
    Write-Host "`n"
    
    Write-Host "Инструкции по использованию:" -ForegroundColor Cyan
    Write-Host "  1. Для управления кластером подключитесь к master узлу:" -ForegroundColor White
    Write-Host "     ssh $Username@$($masterNode.IP)" -ForegroundColor Gray
    Write-Host "     sudo kubectl get nodes" -ForegroundColor Gray
    Write-Host "`n"
    
    Write-Host "  2. Для проверки установки выполните:" -ForegroundColor White
    Write-Host "     .\Check-K8s-Install.ps1" -ForegroundColor Gray
    Write-Host "`n"
    
    if ($joinCommand) {
        Write-Host "  3. Команда для присоединения дополнительных узлов:" -ForegroundColor White
        Write-Host "     $joinCommand" -ForegroundColor Gray
        Write-Host "`n"
    }
    
    Write-Host "  4. Полезные команды Kubernetes:" -ForegroundColor White
    Write-Host "     kubectl get nodes                  # Показать все узлы" -ForegroundColor DarkGray
    Write-Host "     kubectl get pods -A               # Показать все поды" -ForegroundColor DarkGray
    Write-Host "     kubectl cluster-info              # Информация о кластере" -ForegroundColor DarkGray
    Write-Host "     kubectl get svc -A               # Показать все сервисы" -ForegroundColor DarkGray
    Write-Host "`n"
    
    Write-Host "  5. Команды для работы с контейнерами через crictl:" -ForegroundColor White
    Write-Host "     crictl pods                       # Список подов" -ForegroundColor DarkGray
    Write-Host "     crictl images                     # Список образов" -ForegroundColor DarkGray
    Write-Host "     crictl ps                         # Список контейнеров" -ForegroundColor DarkGray
    Write-Host "`n"
    
    Write-Host "  6. Команды для работы с Helm:" -ForegroundColor White
    Write-Host "     helm version                          # Версия Helm" -ForegroundColor DarkGray
    Write-Host "     helm repo list                       # Список репозиториев" -ForegroundColor DarkGray
    Write-Host "     helm search repo nginx               # Поиск чартов" -ForegroundColor DarkGray
    Write-Host "     helm install my-app stable/nginx     # Установка приложения" -ForegroundColor DarkGray
    Write-Host "     helm install bitnami-app oci://registry-1.docker.io/bitnamicharts/nginx  # Bitnami через OCI" -ForegroundColor DarkGray
    Write-Host "     /usr/local/bin/check-helm.sh         # Проверка установки Helm" -ForegroundColor DarkGray
    Write-Host "`n"
    
    Write-Host "  7. Команды для работы с Kompose:" -ForegroundColor White
    Write-Host "     kompose version                       # Версия Kompose" -ForegroundColor DarkGray
    Write-Host "     kompose convert -f docker-compose.yml # Конвертация Docker Compose" -ForegroundColor DarkGray
    Write-Host "     kompose up -f docker-compose.yml     # Развертывание в кластер" -ForegroundColor DarkGray
    Write-Host "     kompose down -f docker-compose.yml   # Удаление из кластера" -ForegroundColor DarkGray
    Write-Host "     kompose convert --chart              # Создание Helm чарта" -ForegroundColor DarkGray
    Write-Host "     /usr/local/bin/check-kompose.sh      # Проверка установки Kompose" -ForegroundColor DarkGray
    Write-Host "     /usr/local/bin/test-kompose.sh       # Тестирование Kompose" -ForegroundColor DarkGray
    Write-Host "`n"
    
    Write-Host "  8. Установка дашбордов:" -ForegroundColor White
    Write-Host "     Для установки дашбордов (Kubernetes Dashboard, Grafana, Prometheus и т.д.)" -ForegroundColor DarkGray
    Write-Host "     выполните отдельный скрипт: .\SetupDashboards.ps1" -ForegroundColor DarkGray
    Write-Host "`n"
    
    Write-Host "Статус кластера можно проверить на master узле:" -ForegroundColor Cyan
    Write-Host "  Все поды должны быть в состоянии Running" -ForegroundColor Gray
    Write-Host "  Все узлы должны быть в состоянии Ready" -ForegroundColor Gray
    Write-Host "`n"
    
    Write-Host "Примечание: Полная инициализация кластера может занять несколько минут." -ForegroundColor Yellow
    Write-Host "Если какие-то поды не запускаются, проверьте логи командой:" -ForegroundColor Yellow
    Write-Host "  kubectl describe pod <имя_пода> -n <namespace>" -ForegroundColor Gray
    Write-Host "  crictl logs <идентификатор_контейнера>          # Просмотр логов контейнера" -ForegroundColor Gray
}

# ============================================
# ЗАПУСК УСТАНОВКИ
# ============================================

# Заголовок скрипта
Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    АВТОМАТИЧЕСКАЯ УСТАНОВКА KUBERNETES      ║" -ForegroundColor Cyan
Write-Host "║          КЛАСТЕРА v1.33.4                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

Write-Host "Скрипт установки Kubernetes:" -ForegroundColor Yellow
Write-Host "Компоненты Kubernetes будут загружены с GitHub" -ForegroundColor Gray
Write-Host "Дополнительно будет установлен Helm $HelmVersion с поддержкой OCI репозиториев" -ForegroundColor Green
Write-Host "Дополнительно будет установлен Kompose $KomposeVersion для конвертации Docker Compose" -ForegroundColor Green
Write-Host "`n"

# Проверка наличия Plink
Write-Step "Проверка наличия PuTTY Plink" -Status "START"

$plinkPath = Get-Command plink.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $plinkPath) {
    $possiblePaths = @(
        "$env:ProgramFiles\PuTTY\plink.exe",
        "${env:ProgramFiles(x86)}\PuTTY\plink.exe",
        "$env:USERPROFILE\Downloads\plink.exe",
        "$env:TEMP\plink.exe"
    )
    
    $found = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $plinkPath = $path
            $found = $true
            Write-SubStep "Plink найден: $path" -Status "SUCCESS"
            break
        }
    }
    
    if (-not $found) {
        Write-SubStep "Plink не найден, попытка скачать..." -Status "WARNING"
        try {
            $plinkUrl = "https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe"
            $downloadPath = "$env:TEMP\plink.exe"
            
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($plinkUrl, $downloadPath)
            
            $plinkPath = $downloadPath
            Write-SubStep "Plink успешно скачан: $downloadPath" -Status "SUCCESS"
        }
        catch {
            Write-Step "Не удалось скачать Plink" -Status "ERROR"
            Write-Host "`nУстановите PuTTY вручную:" -ForegroundColor Red
            Write-Host "1. Скачайте PuTTY с https://www.putty.org/" -ForegroundColor Yellow
            Write-Host "2. Установите его" -ForegroundColor Yellow
            Write-Host "3. Запустите скрипт снова`n" -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-SubStep "Plink найден: $plinkPath" -Status "SUCCESS"
}

Write-Step "Проверка наличия PuTTY Plink" -Status "END"

# Подтверждение начала установки
Write-Host "`n"
Write-Host "Готовы начать установку Kubernetes кластера?" -ForegroundColor Yellow
Write-Host "Убедитесь, что все ВМ запущены и доступны по сети." -ForegroundColor Gray
Write-Host "Компоненты Kubernetes будут загружены с GitHub." -ForegroundColor Green
Write-Host "Helm $HelmVersion будет установлен на master узле." -ForegroundColor Green
Write-Host "Kompose $KomposeVersion будет установлен на master узле." -ForegroundColor Green
Write-Host "Для установки дашбордов выполните отдельный скрипт SetupDashboards.ps1" -ForegroundColor Green

$confirm = Read-Host "Начать установку? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "`nУстановка отменена пользователем.`n" -ForegroundColor Red
    exit 0
}

# Запуск установки
try {
    Install-Kubernetes
}
catch {
    Write-Host "`n"
    Write-Host "══════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "   УСТАНОВКА ПРЕРВАНА ИЗ-ЗА ОШИБКИ!          " -ForegroundColor Red
    Write-Host "══════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "`nОшибка: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Строка: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
    Write-Host "`nПроверьте:"
    Write-Host "1. Доступность всех ВМ по сети" -ForegroundColor Yellow
    Write-Host "2. Правильность учетных данных SSH" -ForegroundColor Yellow
    Write-Host "3. Достаточно ли ресурсов на ВМ" -ForegroundColor Yellow
    Write-Host "4. Наличие интернет-подключения на ВМ`n" -ForegroundColor Yellow
}

# Завершение скрипта
Write-Host "`n"
Write-Host "Скрипт завершен: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host "Нажмите любую клавишу для выхода..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")