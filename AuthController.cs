using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System;
using YourApp.Models; // Assume you have a model for login data

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    // Required service for database access (ADO.NET/SQL Adapter)
    private readonly DatabaseService _dbService; 
    private readonly IConfiguration _config;

    public AuthController(DatabaseService dbService, IConfiguration config)
    {
        _dbService = dbService;
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel login)
    {
        // 1. Validate Credentials using SQL Adapter
        // Replace this with actual ADO.NET logic to query the User_Master table
        // and securely verify the password hash.
        var user = _dbService.ValidateUser(login.Username, login.Password); 

        if (user == null)
        {
            // 2. Login Failure
            // Returning 401 Unauthorized status automatically triggers the error: function in AJAX
            return Unauthorized(new { message = "Invalid Username or Password." }); 
        }

        // 3. Login Successful: Create JWT Token
        var token = GenerateJwtToken(user);

        // 4. Return Token
        return Ok(new { token = token });
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]) // Secret key from appsettings.json
        );
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Define claims to include in the token (e.g., UserID, Username)
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
            // Add more claims as needed (e.g., roles)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(30), // Token valid for 30 minutes
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}