using AutoMapper;
using GM.EFCore.Repositories.Base;
using PrsService.Domain.Entities;
using PrsService.Services.Contracts.DataBlock;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Implementations.Mapping
{
    /// <summary>Профиль автомаппера для сущности тамбур</summary>
    public class TamburMappingsProfile : Profile
    {
        /// <summary><inheritdoc cref="TamburMappingsProfile"/> </summary>
        public TamburMappingsProfile()
        {
            CreateMap<CreatingTamburDto, TamburPrs>()
                .ForMember(a => a.Id, memberConfiguration => memberConfiguration.Ignore())
                .ReverseMap();

            CreateMap<TamburDto,TamburPrs>().ReverseMap();
            CreateMap<Page<TamburDto>, Page<TamburPrs>>().ReverseMap();

            CreateMap<Func<CreatingTamburDto,bool> , Func<TamburPrs, bool>>()
                ;

            CreateMap<DataBlockDto, CreatingTamburDto>()
           .ForMember(x => x.CreateAt, memberConfiguration => memberConfiguration.Ignore())
          ;
        }
    }
}
