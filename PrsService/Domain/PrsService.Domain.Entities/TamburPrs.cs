// Ignore Spelling: Tambur Prs

using GM.EFCore.Entities.Base;

namespace PrsService.Domain.Entities
{
    /// <summary> Тамбур поставленный на ПРС</summary>
    /// <typeparam name="TKey">Тип первичного ключа</typeparam>
    public class TamburPrs<TKey>: TimedEntity<TKey>
    {
        public virtual ICollection<Production>? Productions { get; set; }
    }

    /// <summary><inheritdoc/> </summary>
    public class TamburPrs : TamburPrs<Guid> { }
}
