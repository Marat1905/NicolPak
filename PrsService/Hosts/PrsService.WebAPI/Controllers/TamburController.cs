// Ignore Spelling: Tambur Prs

using AutoMapper;
using GM.EFCore.Interfaces.Repositories;
using GM.EFCore.Repositories.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrsService.Services.Abstractions;
using PrsService.WebAPI.Enums;
using PrsService.WebAPI.Models;
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

        /// <summary><inheritdoc cref="TamburController"/></summary>
        /// <param name="logger">Логгер</param>
        /// <param name="service">Сервис для работы с тамбурами</param>
        /// <param name="mapper">Автомаппер</param>
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
        public async Task<ActionResult<IPage<TamburResponse>>> GetPage(int PageNumber, int PageSize)
        {
            var result = await _service.GetPageAsync(PageNumber, PageSize);
            return result.Items.Any()
                ? Ok(_mapper.Map<Page<TamburResponse>>(result))
                : NotFound(result);
        }

        /// <summary>Получить коллекцию тамбуров за смену</summary>
        /// <param name="smena">Модель для получения смены</param>
        /// <returns>Коллекция тамбуров</returns>
        [HttpGet]
        [Route("GetSmena")]
        [ProducesResponseType<TamburResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IPage<TamburResponse>>> GetSmena([FromQuery] SmenaReqest smena)
        {
            if (smena != null)
            {
                DateTimeStartEnd(smena, out DateTime start, out DateTime end);

                var tamburPeriod = await _service.GetInTimeInterval(start, end);
                return Ok(_mapper.Map<IEnumerable<TamburResponse>>(tamburPeriod));
            }
            return BadRequest();

        }

        /// <summary>Получить коллекцию тамбуров за период </summary>
        /// <param name="Start" example="2025-03-05 08:20:00">Начальный диапазон</param>
        /// <param name="End"  example="2025-03-18 20:00:00">Конечный диапазон</param>
        /// <param name="PageNumber"  example="0">Номер страницы начиная с нуля</param>
        /// <param name="PageSize"  example="10">Размер страницы</param>
        /// <returns>Коллекция тамбуров</returns>
        [HttpGet]
        [Route("GetPeriod")]
        [ProducesResponseType<TamburResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetPeriod([FromQuery] DateTime Start, [FromQuery] DateTime End, [FromQuery] int PageNumber, [FromQuery] int PageSize)
        {
            if (Start<End)
            {
                var tamburPeriod = await _service.GetPageInTimeIntervalPage(Start, End,PageNumber,PageSize);
                return Ok(_mapper.Map<Page<TamburResponse>>(tamburPeriod));
            }
            return BadRequest("Не правильно задан период");

        }


        private void DateTimeStartEnd(SmenaReqest smena, out DateTime start, out DateTime end)
        {
            if (smena.Shift == Smena.Day)
            {
                TimeOnly timeStart = new TimeOnly(08, 00, 00);
                start = smena.Date.ToDateTime(timeStart);
                end = start.AddHours(12);
            }
            else
            {
                TimeOnly timeStart = new TimeOnly(20, 00, 00);
                start = smena.Date.ToDateTime(timeStart);
                end = start.AddHours(12);
            }
        }
    }
}
