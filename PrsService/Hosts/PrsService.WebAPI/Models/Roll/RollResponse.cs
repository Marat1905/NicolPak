namespace PrsService.WebAPI.Models.Roll
{
    /// <summary>Модель рулона для ответа </summary>
    public class RollResponse
    {
        /// <summary>Идентификатор </summary>
        public Guid Id { get; set; }

        /// <summary>Идентификатор тамбура </summary>
        public Guid TamburPrsId { get; set; }

        /// <summary>Идентификатор переданный из ПЛК</summary>
        public int RollID { get; set; }

        /// <summary>Ширина рулона </summary>
        public double RollWidth { get; set; }

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

        /// <summary>Время создания</summary>
        public DateTime CreateAt { get; set; }


    }
}
