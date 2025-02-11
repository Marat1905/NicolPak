using BdmService.Domain.Entities.Enums;
using GM.EFCore.Entities.Base;

namespace BdmService.Domain.Entities;

/// <summary>
/// Сущность обрывов
/// </summary>
/// <typeparam name="TKey">Тип первичного ключа</typeparam>
public class Break<TKey> : Entity<TKey>
{
    /// <summary>Заданный вес бумажного полотна </summary>
    public double SetPointPaperWeight { get; set; }

    /// <summary>Фактический вес бумажного полотна </summary>
    public double ActualPaperWeight { get; set; }

    /// <summary>Заданная влажность бумажного полотна </summary>
    public double SetPointPaperMoisture { get; set; }

    /// <summary>Фактическая влажность бумажного полотна </summary>
    public double ActualPaperMoisture { get; set; }

    /// <summary>Фактическая скорость сетки</summary>
    public double WireSpeed { get; set; }

    /// <summary>Фактическая скорость наката</summary>
    public double ReleerSpeed { get; set; }

    /// <summary>Время начала обрыва</summary>
    public DateTimeOffset StartBreak { get; set; }

    /// <summary>Время конца обрыва</summary>
    public DateTimeOffset? EndBreak { get; set; }

    /// <summary>Время обрыва</summary>
    public TimeSpan? TimeBreak { get; set; }

    /// <summary>Место обрыва</summary>
    public BreakStatus Status { get; set; }
}

/// <summary><inheritdoc/> </summary>
public class Break : Break<Guid> { }
