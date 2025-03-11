// Ignore Spelling: Prs Tambur

using GM.EFCore.Entities.Base;

namespace PrsService.Domain.Entities
{
    public class Production<TKey> : TimedEntity<TKey>
    {
        /// <summary>Тип продукта</summary>
        public string  Product {  get; set; }

        /// <summary>Смена</summary>
        public int Shift { get; set; }

        /// <summary>Вес бумажного полотна </summary>
        public double PaperWeight { get; set; }

        /// <summary>Средняя скорость намотки </summary>
        public  double AverageSpeed {  get; set; }

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

        /// <summary>Время намотки тамбура</summary>
        public int Time { get; set; }

        public  TKey TamburPrsId {  get; set; }

        public  TamburPrs? TamburPrs { get; set; }

        public  virtual ICollection<Roll>? Rolls { get; set; }


    }
    public class Production : Production<Guid> {}
}
