// Ignore Spelling: Tambur Prs

using AutoMapper;
using GM.EFCore.Interfaces.Repositories;
using GM.EFCore.Repositories.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrsService.Services.Abstractions;
using PrsService.Services.Contracts.TamburPrs;
using PrsService.WebAPI.Models.Tambur;

namespace PrsService.WebAPI.Controllers
{
    /// <summary>
    /// Контроллер Тамбуров
    /// </summary>
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class TamburController : ControllerBase
    {
        private readonly ILogger<TamburController> _logger;
        private readonly ITamburService _service;
        private readonly IMapper _mapper;

        public TamburController(ILogger<TamburController> logger,ITamburService service, IMapper mapper)
        {
            _logger = logger;
            _service = service;
            _mapper = mapper;
        }

        /// <summary>
        /// Получение объекта тамбура
        /// </summary>
        /// <remarks>Данный метод позволяет получить объект тамбура по её идентификатору</remarks>
        /// <param name="id">Идентификатор тамбура</param>
        /// <response code="200">Получение объекта тамбура</response>
        /// <response code="404">Не удалось найти тамбур по указанному идентификатору</response>
        [HttpGet]
        [Route("{id}")]
        [AllowAnonymous]
        [ProducesResponseType<TamburResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            return await _service.GetByIdAsync(id) is { } tambur ? Ok(_mapper.Map<TamburResponse>(tambur)) : NotFound($"Не удалось найти тамбур по указанному идентификатору");
        }

        /// <summary>Получить страницу с тамбурами</summary>
        /// <param name="PageNumber">Номер страницы начиная с нуля</param>
        /// <param name="PageSize">Размер страницы</param>
        /// <returns>Страница с тамбурами</returns>
        [HttpGet("page/{PageNumber:int}/{PageSize:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public virtual async Task<ActionResult<IPage<TamburResponse>>> GetPage(int PageNumber, int PageSize)
        {
            var result = await _service.GetPageAsync(PageNumber, PageSize);
            return result.Items.Any()
                ? Ok(_mapper.Map<Page<TamburResponse>>(result))
                : NotFound(result);
        }

    }
}
