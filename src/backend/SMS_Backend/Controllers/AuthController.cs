//using Microsoft.AspNetCore.Mvc;
//using SMS_Backend.Data;
//using SMS_Backend.Models;
//using SMS_Backend.Services;
//using BCrypt.Net;
//using Microsoft.EntityFrameworkCore;
//using SMS_Backend.DTOs;


//namespace SMS_Backend.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class AuthController : ControllerBase
//    {
//        private readonly ApplicationDbContext _context;
//        private readonly JwtService _jwtService;

//        public AuthController(ApplicationDbContext context, JwtService jwtService)
//        {
//            _context = context;
//            _jwtService = jwtService;
//        }

//        // REGISTER (optional for now)
//        [HttpPost("register")]
//        public async Task<IActionResult> Register([FromBody] User user)

//        {
//            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

//            _context.Users.Add(user);
//            await _context.SaveChangesAsync();

//            return Ok("User registered successfully");
//        }

//        // LOGIN
//        [HttpPost("login")]
//        public async Task<IActionResult> Login([FromBody] LoginDto request)
//        {
//            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);

//            if (user == null)
//                return BadRequest("User not found");

//            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
//                return BadRequest("Invalid password");

//            var token = _jwtService.GenerateToken(user);

//            return Ok(new
//            {
//                message = "Login successful",
//                token,
//                user = new
//                {
//                    id = user.UserId,
//                    name = user.Username,
//                    email = user.Email,
//                    role = user.Role.ToString().ToLower()
//                }
//            });
//        }
//    }
//}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SMS_Backend.Data;
using SMS_Backend.Models;
using SMS_Backend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SMS_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        private readonly AuditLogService _audit;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration config,
            AuditLogService audit)
        {
            _context = context;
            _config = config;
            _audit = audit;
        }

        // ── POST: api/auth/login ─────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and password are required." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password." });

            if (!user.IsActive)
                return Unauthorized(new { message = "Account is deactivated. Contact admin." });

            var token = GenerateToken(user);

            // FR-15: log successful login
            await _audit.LogAsync(user.UserId, AuditLogService.Actions.Login,
                $"User '{user.Username}' logged in from IP {HttpContext.Connection.RemoteIpAddress}");

            // ⚠️  Keep field names matching the frontend User type:
            //     id, name, email, role  (NOT userId / username)
            return Ok(new
            {
                token,
                user = new
                {
                    id = user.UserId,           // frontend expects  "id"
                    name = user.Username,         // frontend expects  "name"
                    email = user.Email,
                    role = user.Role.ToString().ToLower()
                }
            });
        }

        // ── POST: api/auth/register ──────────────────────────
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Email already exists." });

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return Conflict(new { message = "Username already taken." });

            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
                return BadRequest(new { message = "Invalid role. Use: Admin, Teacher, Student, Parent" });

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            await _audit.LogAsync(user.UserId, AuditLogService.Actions.RegisterUser,
                $"New user '{user.Username}' registered with role '{role}'");

            return CreatedAtAction(nameof(Login), new { },
                new { message = "User registered successfully.", user.UserId, user.Username, user.Email });
        }

        // ── JWT generator ────────────────────────────────────
        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name,           user.Username),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.Role,           user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}