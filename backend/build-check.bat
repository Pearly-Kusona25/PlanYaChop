@echo off
echo Checking Java project structure...

echo.
echo === Project Structure Check ===
if exist "src\main\java\com\smartrecipe\SmartRecipeApplication.java" (
    echo ✓ Main application class exists
) else (
    echo ✗ Main application class missing
)

if exist "src\main\java\com\smartrecipe\controller\AuthController.java" (
    echo ✓ AuthController exists
) else (
    echo ✗ AuthController missing
)

if exist "src\main\java\com\smartrecipe\controller\LandingController.java" (
    echo ✓ LandingController exists
) else (
    echo ✗ LandingController missing
)

if exist "src\main\java\com\smartrecipe\service\AuthService.java" (
    echo ✓ AuthService exists
) else (
    echo ✗ AuthService missing
)

if exist "src\main\java\com\smartrecipe\model\User.java" (
    echo ✓ User model exists
) else (
    echo ✗ User model missing
)

if exist "src\main\java\com\smartrecipe\config\SecurityConfig.java" (
    echo ✓ SecurityConfig exists
) else (
    echo ✗ SecurityConfig missing
)

if exist "src\main\resources\templates\landing.html" (
    echo ✓ Landing template exists
) else (
    echo ✗ Landing template missing
)

if exist "src\main\resources\templates\login.html" (
    echo ✓ Login template exists
) else (
    echo ✗ Login template missing
)

if exist "src\main\resources\templates\register.html" (
    echo ✓ Register template exists
) else (
    echo ✗ Register template missing
)

if exist "pom.xml" (
    echo ✓ Maven configuration exists
) else (
    echo ✗ Maven configuration missing
)

echo.
echo === Configuration Check ===
if exist "src\main\resources\application.properties" (
    echo ✓ Application properties exist
) else (
    echo ✗ Application properties missing
)

echo.
echo === Next Steps ===
echo 1. Install Java 17 or higher
echo 2. Set JAVA_HOME environment variable
echo 3. Run: .\mvnw.cmd spring-boot:run
echo 4. Access: http://localhost:8080

pause
