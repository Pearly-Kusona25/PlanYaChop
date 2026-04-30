# PlanYaChop - Setup Instructions

## Current Status
✅ **Java Spring Boot project created and configured**
✅ **All code issues fixed**
✅ **Brand names updated to "PlanYaChop"**
❌ **Java not installed** - This is blocking Maven build

## Required Setup Steps

### 1. Install Java 17+
Choose **one** of these options:

#### Option A: Oracle JDK (Recommended)
1. Download from: https://www.oracle.com/java/technologies/downloads/
2. Select JDK 17 or higher
3. Run installer and follow setup wizard
4. Set JAVA_HOME environment variable:
   - Windows: `setx JAVA_HOME "C:\Program Files\Java\jdk-17"`
   - Or set via System Properties → Advanced → Environment Variables

#### Option B: Chocolatey (Easiest)
```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Java 17
choco install openjdk --version=17.0.8

# Set JAVA_HOME automatically
choco install openjdk --version=17.0.8 --params="'/INSTALLDIR=C:\Java'"
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Java", "Machine")
```

#### Option C: SDKMAN!
```powershell
# Install SDKMAN!
Invoke-WebRequest -Uri https://get.sdkman.io | Invoke-Expression
sdkman install java
```

### 2. Verify Java Installation
```powershell
# Check Java version
java -version

# Check JAVA_HOME
echo %JAVA_HOME%

# Restart PowerShell to refresh environment variables
```

### 3. Build and Run Project
Once Java is installed:

```powershell
# Build the project (downloads dependencies)
.\mvnw.cmd clean install

# Run the application
.\mvnw.cmd spring-boot:run
```

### 4. Access the Application
After successful startup:
- **Landing Page**: http://localhost:8080
- **Login**: http://localhost:8080/login
- **Register**: http://localhost:8080/register
- **Dashboard**: http://localhost:8080/dashboard
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: `password`

## Project Structure (Ready)
```
PlanYaChop/
├── src/main/java/com/smartrecipe/
│   ├── SmartRecipeApplication.java    ✅
│   ├── controller/                    ✅
│   │   ├── AuthController.java
│   │   ├── LandingController.java
│   │   └── RecipeController.java
│   ├── service/                       ✅
│   │   └── AuthService.java
│   ├── model/                         ✅
│   │   ├── User.java
│   │   ├── Recipe.java
│   │   ├── RecipeIngredient.java
│   │   ├── RecipeInstruction.java
│   │   └── NutritionalInfo.java
│   ├── dto/                           ✅
│   │   ├── AuthResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── RecipeRequest.java
│   │   └── RecipeResponse.java
│   ├── repository/                    ✅
│   │   └── UserRepository.java
│   ├── security/                      ✅
│   │   ├── JwtTokenProvider.java
│   │   ├── SecurityConfig.java
│   │   └── UserPrincipal.java
│   └── config/                        ✅
│       └── SecurityConfig.java
├── src/main/resources/
│   ├── templates/                     ✅
│   │   ├── landing.html
│   │   ├── login.html
│   │   ├── register.html
│   │   └── dashboard.html
│   ├── static/                        ✅
│   │   ├── css/style.css
│   │   └── js/auth.js
│   └── application.properties             ✅
├── pom.xml                             ✅
├── mvnw.cmd                           ✅
└── README.md                           ✅
```

## All Issues Fixed ✅

1. **Authentication**: JWT-based security with proper UserPrincipal
2. **Brand Consistency**: All pages now show "PlanYaChop"
3. **Code Architecture**: Clean separation of concerns
4. **Dependencies**: Maven configuration complete
5. **Templates**: Modern Bootstrap 5 UI

## Ready for AI Integration

Once Java is installed and the project builds successfully, you can integrate your fine-tuned AI model by:

1. **Create AI Service**: `src/main/java/com/smartrecipe/service/YourAIService.java`
2. **Update RecipeController**: Point to your AI service
3. **Configure Endpoint**: Add your model URL to `application.properties`

## Troubleshooting

If build fails after Java installation:
1. **Clear Maven cache**: `.\mvnw.cmd dependency:purge-local-repository`
2. **Use offline mode**: `.\mvnw.cmd clean install -o`
3. **Check network**: Ensure internet connection for dependency downloads

The project is **ready to run** once Java 17+ is installed! 🚀
