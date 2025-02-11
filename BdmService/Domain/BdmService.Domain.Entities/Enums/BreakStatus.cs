using System.ComponentModel;

namespace BdmService.Domain.Entities.Enums
{
    /// <summary>Статус обрывов </summary>
    public enum BreakStatus
    {
        /// <summary>Нет связи</summary>
        [Description("НЕТ СВЯЗИ")]
        NoConnection = 0,

        /// <summary>Бумага ОК</summary>
        [Description("БУМАГА ОК")]
        PaperOK = 1,

        /// <summary>Обрыв в комби прессе</summary>
        [Description("ОБРЫВ В КОМБИ ПРЕССЕ")]
        BreakCombiPress = 2,

        /// <summary>Обрыв в Jumbo прессе</summary>
        [Description("ОБРЫВ В JUMBO ПРЕССЕ")]
        BreakJumboPress = 3,

        /// <summary>Обрыв перед 1-й сушильной группой</summary>
        [Description("ОБРЫВ ПЕРЕД 1-Й СУШИЛЬНОЙ ГРУППОЙ")]
        Break1DryingGroup = 4,

        /// <summary>Обрыв во 2-й сушильной группе</summary>
        [Description("ОБРЫВ ВО 2-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break2DryingGroup = 5,

        /// <summary>Обрыв в 3-й сушильной группе</summary>
        [Description("ОБРЫВ В 3-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break3DryingGroup = 6,

        /// <summary>Обрыв в 4-й сушильной группе</summary>
        [Description("ОБРЫВ В 4-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break4DryingGroup = 7,

        /// <summary>Обрыв в 5-й сушильной группе</summary>
        [Description("ОБРЫВ В 5-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break5DryingGroup = 8,

        /// <summary>Обрыв в 6-й сушильной группе</summary>
        [Description("ОБРЫВ В 6-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break6DryingGroup = 9,

        /// <summary>Обрыв в 7-й сушильной группе</summary>
        [Description("ОБРЫВ В 7-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break7DryingGroup = 10,

        /// <summary>Обрыв в 8-й сушильной группе</summary>
        [Description("ОБРЫВ В 8-Й СУШИЛЬНОЙ ГРУППЕ")]
        Break8DryingGroup = 11,

        /// <summary>Обрыв перед накатом</summary>
        [Description("ОБРЫВ ПЕРЕД НАКАТОМ")]
        BreakReleer = 12
    }
}
