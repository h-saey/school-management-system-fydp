using Microsoft.AspNetCore.Mvc;
using SMS_Backend.Data;
using SMS_Backend.Models;
using SMS_Backend.Services;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using SMS_Backend.DTOs;


namespace SMS_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // REGISTER (optional for now)
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)

        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully");
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);

            if (user == null)
                return BadRequest("User not found");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Invalid password");

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,
                user = new
                {
                    id = user.UserId,
                    name = user.Username,
                    email = user.Email,
                    role = user.Role.ToString().ToLower()
                }
            });
        }
    }
}
