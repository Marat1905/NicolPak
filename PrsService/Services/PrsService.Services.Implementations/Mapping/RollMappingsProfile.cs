using AutoMapper;
using GM.EFCore.Repositories.Base;
using PrsService.Domain.Entities;
using PrsService.Services.Contracts.DataBlock;
using PrsService.Services.Contracts.Roll;
using PrsService.Services.Contracts.TamburPrs;

namespace PrsService.Services.Implementations.Mapping
{
    /// <summary>Профиль автомаппера для сущности тамбур</summary>
    public class RollMappingsProfile : Profile
    {
        /// <summary><inheritdoc cref="RollMappingsProfile"/> </summary>
        public RollMappingsProfile()
        {
            CreateMap<CreatingRollDto, Roll>()
                .ForMember(a => a.Id, memberConfiguration => memberConfiguration.Ignore())
                .ReverseMap();

            CreateMap<RollDbDto, CreatingRollDto>()
                 .ForMember(x => x.CreateAt, memberConfiguration => memberConfiguration.Ignore())
                ;

            CreateMap<RollDto, Roll>().ReverseMap();

            CreateMap<Page<RollDto>, Page<Roll>>().ReverseMap();
        }
    }
}
