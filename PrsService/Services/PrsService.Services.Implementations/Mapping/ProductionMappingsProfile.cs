using AutoMapper;
using PrsService.Domain.Entities;
using PrsService.Services.Contracts.DataBlock;
using PrsService.Services.Contracts.Production;
using PrsService.Services.Contracts.Roll;

namespace PrsService.Services.Implementations.Mapping
{
    /// <summary>Профиль автомаппера для сущности тамбур</summary>
    public class ProductionMappingsProfile : Profile
    {
        /// <summary><inheritdoc cref="ProductionMappingsProfile"/> </summary>
        public ProductionMappingsProfile()
        {
            CreateMap<CreatingProductionDto, Production>()
                .ForMember(a => a.Id, memberConfiguration => memberConfiguration.Ignore())
                .ReverseMap();

            CreateMap<DataBlockDto, CreatingProductionDto>()
                 .ForMember(x => x.CreateAt,  memberConfiguration => memberConfiguration.Ignore())
                ;

       

            CreateMap<ProductionDto, Production>().ReverseMap();
        }
    }
}
