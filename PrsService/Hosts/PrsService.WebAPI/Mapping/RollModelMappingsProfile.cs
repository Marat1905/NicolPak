using AutoMapper;
using GM.EFCore.Repositories.Base;
using PrsService.Services.Contracts.Roll;
using PrsService.Services.Contracts.TamburPrs;
using PrsService.WebAPI.Models.Roll;
using PrsService.WebAPI.Models.Tambur;

namespace PrsService.WebAPI.Mapping
{
    /// <summary>Профиль автомаппера для сущности рулона</summary>
    public class RollModelMappingsProfile : Profile
    {
        /// <summary><inheritdoc cref="RollModelMappingsProfile"/> </summary>
        public RollModelMappingsProfile()
        {

            CreateMap<RollDto, RollResponse>()
                .ForMember(rp => rp.Id, m => m.MapFrom(s => s.Id))
                .ForMember(rp => rp.RollID, m => m.MapFrom(s => s.RollID))
                .ForMember(rp => rp.RollWidth, m => m.MapFrom(s => s.RollWidth))
                .ForMember(rp => rp.Product, m => m.MapFrom(s => s.Production.Product))
                .ForMember(rp => rp.Shift, m => m.MapFrom(s => s.Production.Shift))
                .ForMember(rp => rp.PaperWeight, m => m.MapFrom(s => s.Production.PaperWeight))
                .ForMember(rp => rp.AverageSpeed, m => m.MapFrom(s => s.Production.AverageSpeed))
                .ForMember(rp => rp.AverageTension, m => m.MapFrom(s => s.Production.AverageTension))
                .ForMember(rp => rp.SetLength, m => m.MapFrom(s => s.Production.SetLength))
                .ForMember(rp => rp.FactLength, m => m.MapFrom(s => s.Production.FactLength))
                .ForMember(rp => rp.SetDiameter, m => m.MapFrom(s => s.Production.SetDiameter))
                .ForMember(rp => rp.FactDiameter, m => m.MapFrom(s => s.Production.FactDiameter))
                .ForMember(rp => rp.Core, m => m.MapFrom(s => s.Production.Core))
                .ForMember(rp => rp.TamburPrsId, m => m.MapFrom(s => s.Production.TamburPrsId))
                .ForMember(rp => rp.CreateAt, m => m.MapFrom(s => s.Production.CreateAt))
                ;

            CreateMap<Page<RollDto>, Page<RollResponse>>().ReverseMap();
        }
    }
}
