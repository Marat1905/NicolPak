using GM.EFCore.Entities.Base;
using PrsService.Services.Contracts.Roll;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Contracts.Production
{
    public class ProductionDto<TKey> : TimedEntity<TKey>
    {
        /// <summary>Тип продукта</summary>
        public  string Product { get; set; }

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

        /// <summary>Диаметр втулки</summary>
        public int RollId { get; set; }

        /// <summary>Сохранить данные о рулонах</summary>
        public bool IsProductionSet { get; set; }

        /// <summary>Установить тамбур</summary>
        public bool IsTamburSet { get; set; }

        public  TKey TamburPrsId { get; set; }

        public  TamburDto TamburPrs { get; set; }


        public override string ToString()
        {
            return $"Продукт - {Product}; Смена - {Shift}; Вес бумажного полотна - {PaperWeight}; ср. скорость - {Math.Round(AverageSpeed,0)}; ср. натяжка - {Math.Round(AverageTension, 0)}";
        }


    }
    public class ProductionDto : ProductionDto<Guid> { }
}
