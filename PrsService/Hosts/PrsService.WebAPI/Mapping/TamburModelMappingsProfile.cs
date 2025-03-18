using AutoMapper;
using GM.EFCore.Repositories.Base;
using PrsService.Services.Contracts.TamburPrs;
using PrsService.WebAPI.Models.Tambur;

namespace PrsService.WebAPI.Mapping
{
    /// <summary>Профиль автомаппера для сущности тамбур</summary>
    public class TamburModelMappingsProfile : Profile
    {
        /// <summary><inheritdoc cref="TamburModelMappingsProfile"/> </summary>
        public TamburModelMappingsProfile()
        {
           
            CreateMap<TamburDto, TamburResponse>().ReverseMap();
            CreateMap<Page<TamburDto>, Page<TamburResponse>>().ReverseMap();
        }
    }
}
