# Candidate Takehome Exercise
This is a simple backend engineer take-home test to help assess candidate skills and practices.  We appreciate your interest and have created this exercise as a tool to learn more about how you practice your craft in a realistic environment.  This is a test of your coding ability, but more importantly it is also a test of your overall practices.

If you are a seasoned Node.js developer, the coding portion of this exercise should take no more than 1-2 hours to complete.  Depending on your level of familiarity with Node.js, Express, and Sequelize, it may not be possible to finish in 2 hours, but you should not spend more than 2 hours.  

We value your time, and you should too.  If you reach the 2 hour mark, save your progress and we can discuss what you were able to accomplish. 

The theory portions of this test are more open-ended.  It is up to you how much time you spend addressing these questions.  We recommend spending less than 1 hour.  


For the record, we are not testing to see how much free time you have, so there will be no extra credit for monumental time investments.  We are looking for concise, clear answers that demonstrate domain expertise.

# Project Overview
This project is a simple game database and consists of 2 components.  

The first component is a VueJS UI that communicates with an API and renders data in a simple browser-based UI.

The second component is an Express-based API server that queries and delivers data from an SQLite data source, using the Sequelize ORM.

This code is not necessarily representative of what you would find in our production-ready codebase.  However, this type of stack is could be in regular use.

# Project Setup
You will need to have Node.js, NPM, and git installed locally.  You should not need anything else.

To get started, initialize a local git repo by going into the root of this project and running `git init`.  Then run `git add .` to add all of the relevant files.  Then `git commit` to complete the repo setup.  You will send us this repo as your final product.
  
Next, in a terminal, run `npm install` from the project root to initialize your dependencies.

Finally, to start the application, navigate to the project root in a terminal window and execute `npm start`

You should now be able to navigate to http://localhost:3000 and view the UI.

You should also be able to communicate with the API at http://localhost:3000/api/games

If you get an error like this when trying to build the project: `ERROR: Please install sqlite3 package manually` you should run `npm rebuild` from the project root.

# Practical Assignments
Pretend for a moment that you have been hired to work in our team.  You have grabbed your first tickets to work on an internal game database application. 

#### FEATURE A: Add Search to Game Database
The main users of the Game Database have requested that we add a search feature that will allow them to search by name and/or by platform.  The front end team has already created UI for these features and all that remains is for the API to implement the expected interface.  The new UI can be seen at `/search.html`

The new UI sends 2 parameters via POST to a non-existent path on the API, `/api/games/search`

The parameters that are sent are `name` and `platform` and the expected behavior is to return results that match the platform and match or partially match the name string.  If no search has been specified, then the results should include everything (just like it does now).

Once the new API method is in place, we can move `search.html` to `index.html` and remove `search.html` from the repo.

#### FEATURE B: Populate your database with the top 100 apps
Add a populate button that calls a new route `/api/games/populate`. This route should populate your database with the top 100 games in the App Store and Google Play Store.
To do this, our data team have put in place 2 files at your disposal in an S3 bucket in JSON format:

- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json
- https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json

# Theory Assignments
You should complete these only after you have completed the practical assignments.

The business goal of the game database is to provide an internal service to get data for all apps from all app stores.  
Many other applications will use consume this API.

## Question 1
> We are planning to put this project in production. According to you, what are the missing pieces to make this project production ready? 
Please elaborate an action plan.

### Overall improvements
- **Extended tests** : submitted application clearly lacks unit tests, integration as well as perfromance tests ; coverage would need to be a lot better for this to go into production
- **Extended logs** : current logs are minimal and need to be more detailed and structured in order to be exploitable for monitoring purposes
- **Externalize logs** : current logs are neither stored locally or externalized, this would need to be the case in a production setting (i.e. Datadog)
- **Parallelization** : each task to fetch the `json` files is independent and can thus be parallelized to improve overall performances (i.e. Android and iOS in parallel)
- **Data validation** : current ingestion pipeline neither checks raw data (i.e. duplicate app pair, missing field, bad data types, etc.) nor performs data consistency checks along the pipeline (i.e. make sure ranking is correct, etc.)
- **Execution process logging** : current pipeline does not check if ingestion was done already (i.e. we can click the button 100 times and it'll keep fetching the same data over and over again). Ingestion steps should be persisted as well and leveraged to only fetch data that as changed for instance (i.e. incremental ingestion) 
- **Typing** : current pipeline is written in Javascript so no request/objects are typed ; Typescript should be used instead to make it more robust
- **Reading remote files by chunk** : if files are to become larger and larger, the ingestion of raw files should be done by chunk to prevent memory overload
- **Better table structure** : database structure should be improved/enriched to prevent duplicate entries (i.e. unique keys on `appId` and `platform` or anything that makes sense from a business point of view)
- **Proper games refetch** : call to fetch games should be refactored to isolate the logic

### Product improvements

- **Pagination** : current app display all data without any pagination ; when the list gets big it 1) becomes unreadable and 2) degrades overall performance
- **Loader** : include component-level loaders (i.e. in the table to show that games data is loading and on the "Populate" button to show the process is still running)
- **Success / Error banner** : bubble up all success operations (i.e. after populating games) and errors if any as small toasts
- **Populate flexibility** : backend was built to receive parameters from the frontend (i.e. populate data only for a specific platform and only the first N games) however the frontend does not provide dropdowns or input fields to get this config from the user

### Question 2
> Let's pretend our data team is now delivering new files every day into the S3 bucket, and our service needs to ingest those files
every day through the populate API. Could you describe a suitable solution to automate this? Feel free to propose architectural changes.

**Assumptions**
1. Files are dumped onto a single bucket S3 (not splitted by platform or else)
2. Files follow a specific convention with timestamps in the filename

**Overall logic**
1. Data team dumps files daily (_assumption 1 and 2_)
2. A trigger on "ObjectCreated:Put" is setup to call a lambda function
3. Two alternatives depending on where the API is hosted

*Alternative 1* : API is hosted as an external service somewhere (here EC2 but it can be anywhere else as long as it is accessible via HTTPS)

In this alternative the lambda function will simply make an API call to fetch the latest data.

[[https://github.com/nicnhus22/aura-interview/blob/main/doc/images/archi-1.jpg|alt=Architecture_1]]

*Alternative 2* : API can directly be hosted within lambdas and behind an API gateway so we don't need to call another API from within the lambda

In this alternative the lambda function directly executes the logic* to fetch the latest data.

[[https://github.com/nicnhus22/aura-interview/blob/main/doc/images/archi-2.jpg|alt=Architecture_2]]

4. The API is to go and fetch all files that have not be processed yet (i.e. not in `./archive` folder) and dump them into a dedicated RDS table (or else, does not matter here)
5. The last step is to move all processed files into the `./archive` folder to not process them twice

### Question 3
> Both the current database schema and the files dropped in the S3 bucket are not optimal.
Can you find ways to improve them?

#### Database

- `Game` does not have unique constraints and the ID is auto-generated so this does not prevent from having duplicates. This can be fixed by adding a unique constraint on some columns (let's say `storeId` and `bundleId` if that makes sense from a business POV). 
- `Game.version` is at the root level of the object which might not serve the right purpose : it looks more like a `latestVersion` ; otherwise many records (as many as there are different versions) of the same game can be added in this DB.
- In general the `Game` table isn't very straight forward : 
  - Is this a list of unique games, in which case we should remove some historized attributes (like version, ranking, etc.) and store them in different tables depending on what we'd like to do (i.e. having a `game_version` with the FK to the game object and all different version with there version-specific attributes like `published_date`, etc.)
  - Is this an historized list of games, in which case we should keep all records and filter on the latest version of a game's record if we want to display this kind of view.

#### Files

- Files are structured as nested arrays `[[[game1, game2, game3], [game4, game5, game6]]` so the pipeline has to flatten the array to control the DB bulk size upon insert.
- Files should follow better naming convention to be more explicit (i.e. include a timestamp for the extraction)
