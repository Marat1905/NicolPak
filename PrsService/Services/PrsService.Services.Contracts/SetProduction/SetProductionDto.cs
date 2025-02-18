namespace PrsService.Services.Contracts.SetProduction
{
    public class SetProductionDto
    {
        /// <summary>Сохранить данные о рулонах</summary>
        public bool IsProductionSet { get; set; }

        /// <summary>Установить тамбур</summary>
        public bool IsTamburSet { get; set; }
    }
}
