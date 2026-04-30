# Smart Recipe App

A smart recipe management application with AI integration built with Java Spring Boot. Features recipe generation, meal planning, and ingredient analysis using AI services.

## Features

- **Recipe Generation**: Generate recipes based on available ingredients using AI
- **Meal Planning**: Create personalized meal plans based on dietary preferences
- **Ingredient Analysis**: Analyze ingredients for nutritional information and suggestions
- **AI Integration**: Configurable AI service providers (OpenAI, Anthropic, Local)
- **User Authentication**: Secure login/registration with JWT tokens
- **Modern UI**: Responsive web interface with Bootstrap 5

## Project Structure

```
PlanYaChop/
├── src/
│   ├── main/
│   │   ├── java/com/smartrecipe/
│   │   │   ├── SmartRecipeApplication.java    # Main Spring Boot application
│   │   │   ├── controller/                    # REST controllers
│   │   │   │   ├── AuthController.java        # Authentication endpoints
│   │   │   │   ├── LandingController.java     # Page controllers
│   │   │   │   └── RecipeController.java      # Recipe endpoints
│   │   │   ├── service/                       # Business logic
│   │   │   │   ├── AIService.java            # AI integration service
│   │   │   │   └── AuthService.java          # Authentication service
│   │   │   ├── model/                         # JPA entities
│   │   │   │   ├── User.java                 # User entity
│   │   │   │   └── Recipe.java               # Recipe entity
│   │   │   ├── dto/                           # Data transfer objects
│   │   │   │   ├── RecipeRequest.java        # Recipe generation request
│   │   │   │   ├── RecipeResponse.java       # Recipe response
│   │   │   │   ├── LoginRequest.java         # Login request
│   │   │   │   ├── RegisterRequest.java      # Registration request
│   │   │   │   └── AuthResponse.java         # Authentication response
│   │   │   ├── repository/                    # JPA repositories
│   │   │   │   └── UserRepository.java       # User data access
│   │   │   └── security/                      # Security configuration
│   │   │       ├── JwtTokenProvider.java     # JWT token management
│   │   │       └── UserPrincipal.java        # User principal
│   │   └── resources/
│   │       ├── static/                        # Static assets
│   │       │   ├── css/style.css            # Custom styles
│   │       │   └── js/auth.js               # Authentication JavaScript
│   │       ├── templates/                     # Thymeleaf templates
│   │       │   ├── landing.html             # Landing page
│   │       │   ├── login.html               # Login page
│   │       │   └── register.html            # Registration page
│   │       └── application.properties         # Application configuration
├── test/                                       # Test files
├── pom.xml                                    # Maven configuration
└── README.md                                  # Project documentation
```

## Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- MySQL or H2 database (H2 is configured by default)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd PlanYaChop
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the project root or update `application.properties`:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

5. **Access the application**:
   - Landing page: http://localhost:8080
   - Login: http://localhost:8080/login
   - Register: http://localhost:8080/register
   - H2 Console: http://localhost:8080/h2-console

### Development

1. **Development mode**:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=development
   ```

2. **Run tests**:
   ```bash
   mvn test
   ```

3. **Package for production**:
   ```bash
   mvn clean package
   java -jar target/smart-recipe-app-1.0.0.jar
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Recipe Generation
- `POST /api/recipe/generate` - Generate a recipe from ingredients
  ```json
  {
    "ingredients": ["tomatoes", "pasta", "garlic"],
    "dietaryRestrictions": ["vegetarian"]
  }
  ```

### Meal Planning
- `POST /api/meal-plan/generate` - Generate a meal plan
  ```json
  {
    "days": 7,
    "mealsPerDay": 3,
    "dietaryRestrictions": ["gluten-free"],
    "cuisinePreferences": ["italian", "mexican"],
    "budget": 100
  }
  ```

### Ingredient Analysis
- `POST /api/ingredients/analyze` - Analyze ingredients
  ```json
  {
    "ingredients": ["chicken", "broccoli", "rice"]
  }
  ```

## AI Service Configuration

The application supports multiple AI service providers:

### OpenAI (Default)
- Uses GPT models for recipe generation and analysis
- Configure via environment variables

### Local AI
- Can be configured to use local AI models
- Set `AI_PROVIDER=local` in environment
- Configure endpoint in `src/config/aiConfig.ts`

## Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technologies Used

- **Backend**: Java 17 with Spring Boot 3.2
- **Database**: H2 (in-memory) with JPA/Hibernate
- **Security**: Spring Security with JWT authentication
- **Frontend**: Thymeleaf templates with Bootstrap 5
- **AI Integration**: OpenAI API (configurable)
- **Build Tool**: Maven
- **HTTP Client**: Spring WebFlux WebClient
- **Testing**: JUnit 5 with Spring Boot Test

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Login**: Users authenticate with username/email and password
2. **Token Generation**: JWT access token and refresh token are generated
3. **Token Validation**: Tokens are validated on protected endpoints
4. **Token Refresh**: Access tokens can be refreshed using refresh tokens

## AI Service Configuration

The application supports multiple AI service providers:

### OpenAI (Default)
- Uses GPT models for recipe generation and analysis
- Configure via environment variable `OPENAI_API_KEY`

### Local AI
- Can be configured to use local AI models
- Set configuration in `application.properties`

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Encrypted)
- first_name, last_name
- role (USER/ADMIN)
- enabled (Boolean)
- created_at, updated_at

### Recipes Table
- id (Primary Key)
- title, description
- prep_time, cook_time, servings
- difficulty (EASY/MEDIUM/HARD)
- cuisine, tags
- user_id (Foreign Key)
- created_at, updated_at

## Development Scripts

- `mvn spring-boot:run` - Start development server
- `mvn test` - Run unit and integration tests
- `mvn clean package` - Build JAR file
- `mvn clean install` - Install dependencies and build
