# Development Guidelines for Stay-Go

## 1. Test-Driven Development (TDD) Mandatory
Always follow the TDD cycle when developing any feature, fix, or enhancement:
1. **Red**: Write unit and/or integration tests defining the expected behavior before writing the production code. Verify that tests fail for the right reason.
2. **Green**: Write the minimum production code necessary to make the tests pass.
3. **Refactor**: Clean up the code while keeping tests green.

## 2. Unit Testing
- Every new feature, component, utility, slice/store, controller, model method, and middleware MUST include comprehensive unit tests.
- Edge cases, error handling, and input validations must be thoroughly tested.

## 3. Integration Testing
- Integration testing is required for every feature.
- Test API endpoints with Supertest / HTTP test harnesses, verifying status codes, request validation, database side-effects, and response schemas.
- Test frontend page workflows, component interactions, and Redux/API integrations.

## 4. Test Execution
- Every feature must be validated by running the test suite to ensure all tests pass cleanly before concluding the task.
