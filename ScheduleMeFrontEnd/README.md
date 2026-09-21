# ParishSchedulerUI

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


JD
We have installed  ngxsmk-datepicker package.ngxsmk-datepicker is a high-performance, enterprise-ready date and range picker engineered for the modern Angular ecosystem (v17+). Built from the ground up with Angular Signals, it delivers a seamless, zoneless-ready experience for both desktop and mobile (Ionic) applications. (https://github.com/toozuuu/ngxsmk-datepicker#usage)
Hopefully it uses a highly requested feature called segmented keyboard entry:
	* The date/time layout is broken down into semantic visual segments (e.g., MM, DD, YYYY or hh, mm, aa).
	* Auto-advancing cursor: When a user types a complete, valid value into one segment (for instance, typing 1 then 2 for December, or 2 and 0 for the day), the cursor automatically advances focus to the next logical segment without forcing the user to type a slash / or press the arrow keys.
