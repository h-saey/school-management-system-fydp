using Microsoft.AspNetCore.Mvc;
using SMS_Backend.Data;
using SMS_Backend.Models;
using SMS_Backend.Services;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

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
        public async Task<IActionResult> Register(User user)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully");
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (user == null)
                return BadRequest("User not found");

            if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                return BadRequest("Invalid password");

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                message = "Login successful",
                token,
                role = user.Role
            });
        }
    }
}
