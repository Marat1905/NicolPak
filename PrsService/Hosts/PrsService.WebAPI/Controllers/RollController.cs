using AutoMapper;
using GM.EFCore.Interfaces.Repositories;
using GM.EFCore.Repositories.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrsService.Services.Abstractions;
using PrsService.WebAPI.Enums;
using PrsService.WebAPI.Models;
using PrsService.WebAPI.Models.Roll;
using PrsService.WebAPI.Models.Tambur;

namespace PrsService.WebAPI.Controllers
{
    /// <summary>
    /// Контроллер продукции
    /// </summary>
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class RollController : ControllerBase
    {
        private readonly ILogger<RollController> _logger;
        private readonly IMapper _mapper;
        private readonly IRollService _service;

        public RollController(ILogger<RollController> logger, IMapper mapper, IRollService service)
        {
            _logger = logger;
            _mapper = mapper;
            _service = service;
        }

        /// <summary>
        /// Получение объекта рулона
        /// </summary>
        /// <remarks>Данный метод позволяет получить объект рулона по её идентификатору</remarks>
        /// <param name="id">Идентификатор рулона</param>
        /// <response code="200">Получение объекта рулона</response>
        /// <response code="404">Не удалось найти рулон по указанному идентификатору</response>
        [HttpGet]
        [Route("{id}")]
        [AllowAnonymous]
        [ProducesResponseType<RollResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            return await _service.GetByIdAsync(id) is { } tambur ? Ok(_mapper.Map<RollResponse>(tambur)) : NotFound($"Не удалось найти рулон по указанному идентификатору");
        }

        /// <summary>Получить страницу с рулонами</summary>
        /// <param name="PageNumber">Номер страницы начиная с нуля</param>
        /// <param name="PageSize">Размер страницы</param>
        /// <returns>Страница с рулонами</returns>
        [HttpGet("page/{PageNumber:int}/{PageSize:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IPage<RollResponse>>> GetPage(int PageNumber, int PageSize)
        {
            var result = await _service.GetPageAsync(PageNumber, PageSize);
            return result.Items.Any()
                ? Ok(_mapper.Map<Page<RollResponse>>(result))
                : NotFound(result);
        }

        /// <summary>Получить коллекцию рулонов за смену</summary>
        /// <param name="smena">Модель для получения смены</param>
        /// <returns>Коллекция рулонов</returns>
        [HttpGet]
        [Route("GetSmena")]
        [ProducesResponseType<RollResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IPage<RollResponse>>> GetSmena([FromQuery] SmenaReqest smena)
        {
            if (smena != null)
            {
                DateTimeStartEnd(smena, out DateTime start, out DateTime end);

                var tamburPeriod = await _service.GetInTimeInterval(start, end);
                return Ok(_mapper.Map<IEnumerable<RollResponse>>(tamburPeriod));
            }
            return BadRequest();

        }

        /// <summary>Получить коллекцию рулонов за период </summary>
        /// <param name="Start" example="2025-03-05 08:20:00">Начальный диапазон</param>
        /// <param name="End"  example="2025-03-18 20:00:00">Конечный диапазон</param>
        /// <param name="PageNumber"  example="0">Номер страницы начиная с нуля</param>
        /// <param name="PageSize"  example="10">Размер страницы</param>
        /// <returns>Коллекция рулонов</returns>
        [HttpGet]
        [Route("GetPeriod")]
        [ProducesResponseType<RollResponse>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetPeriod([FromQuery] DateTime Start, [FromQuery] DateTime End, [FromQuery] int PageNumber, [FromQuery] int PageSize)
        {
            if (Start < End)
            {
                var tamburPeriod = await _service.GetPageInTimeIntervalPage(Start, End, PageNumber, PageSize);
                return Ok(_mapper.Map<Page<RollResponse>>(tamburPeriod));
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
