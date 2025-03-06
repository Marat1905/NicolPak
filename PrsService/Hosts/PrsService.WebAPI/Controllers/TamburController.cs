// Ignore Spelling: Tambur Prs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        public TamburController(ILogger<TamburController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        [Route("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get([FromRoute] Guid id)
        {
            await Task.Delay(100);
            return Ok();
        }

    }
}
