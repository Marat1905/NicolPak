using GM.EFCore.Entities.Base;
using PrsService.Services.Contracts.Roll;
using System.Runtime.CompilerServices;

namespace PrsService.Services.Contracts.Production
{
    public class CreatingProductionDto<TKey> 
    {
        /// <summary>Тип продукта</summary>
        public string Product { get; set; }

        /// <summary>Смена</summary>
        public int Shift { get; set; }

        /// <summary>Вес бумажного полотна </summary>
        public double PaperWeight { get; set; }

        /// <summary>Средняя скорость намотки </summary>
        public double AverageSpeed { get; set; }

        /// <summary>Средняя натяжка </summary>
        public double AverageTension { get; set; }

        /// <summary>Заданная длинна рулона</summary>
        public double SetLength { get; set; }

        /// <summary>Фактическая длинна рулона</summary>
        public double FactLength { get; set; }

        /// <summary>Заданный диаметр рулона</summary>
        public double SetDiameter { get; set; }

        /// <summary>Фактический диаметр рулона</summary>
        public double FactDiameter { get; set; }

        /// <summary>Диаметр втулки</summary>
        public int Core { get; set; }

        /// <summary>Время намотки Тамбура в минутах</summary>
        public int Time { get; set; }

        /// <summary>Время создания продукта</summary>
        public DateTime CreateAt { get; set; } = DateTime.Now;

        public List<CreatingRollDto>? Rolls { get; set; }

    }
    public class CreatingProductionDto : CreatingProductionDto<Guid> { }
}
