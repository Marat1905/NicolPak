export default function SaasMetrics() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Входной коллектор
                    </h3>
                </div>
            </div>
            <div className="grid rounded-2xl border border-gray-200 bg-white sm:grid-cols-2 xl:grid-cols-8 dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-200 px-6 py-5 sm:border-r xl:border-b-0 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Время
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                            19.06.2025 13:01
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        +2.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="border-b border-gray-200 px-6 py-5 xl:border-r xl:border-b-0 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Мгновенный Gm3
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                            0.0
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        + 9.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="border-b border-gray-200 px-6 py-5 sm:border-r sm:border-b-0 dark:border-gray-800">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Текущий час Gm3
                        </span>
                        <div className="mt-2 flex items-end gap-3">
                            <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                                0.0
                            </h4>
                            {/*<div>*/}
                            {/*    <span className="bg-error-50 text-error-600 dark:bg-success-500/15 dark:text-error-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                            {/*        -1.6%*/}
                            {/*    </span>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Текущие сутки Gm3
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                            0.0
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        +3.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="px-6 py-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Текущий месяц Gm3
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                            0.0
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        +3.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="px-6 py-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Пред. сутки Gm3
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                            0.0
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        +3.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="px-6 py-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Пред. месяц Gm3
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs  font-bold text-gray-800 dark:text-white/90">
                            0.0
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        +3.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className="px-6 py-5">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Общий Gm3
                    </span>
                    <div className="mt-2 flex items-end gap-3">
                        <h4 className="text-title-xs font-bold text-gray-800 dark:text-white/90">
                            0.0
                        </h4>
                        {/*<div>*/}
                        {/*    <span className="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500 flex items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-sm font-medium">*/}
                        {/*        +3.5%*/}
                        {/*    </span>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}
