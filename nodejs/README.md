# DynamoDB Perfomrance Data Query Task

We need to develop backend logic that allows querying campaign performance statistics stored in DynamoDB based on varying periods and date constraints. The data structure adheres to a specific schema where each record encapsulates metrics for views, likes, comments, and shares, aggregated over hourly, daily, weekly, and monthly intervals.

## Data Schema
Records in DynamoDB are structured with the following attributes:

* `id`: `c_{campaignId}` (the mock data uses campaignId 1234)
* `recType`: Contains the period and date (e.g., `performance_hourly_{YYYY-MM-DD-HH}`, `performance_weekly_{YYYY-WW}`, `performance_monthly_{YYYY-MM}`)
* `views_count`: Total views count
* `likes_count`: Total likes count
* `comments_count`: Total comments count
* `share_count`: Total share count

## Objectives
Implement functionality that allows querying this data based on:

* Period: User should be able to specify the aggregation period (Hourly, Daily, Weekly, Monthly).
* Date Range: Allow filtering records between specific start and end dates, or from a certain date.
* Limit: Ability to specify the number of records to retrieve (in terms of hours, days, weeks, or months).

## Requirements
API Endpoint: Add a RESTful API endpoint to handle query requests of the performance data.
Query Parameters:
* period: One of ['Hourly', 'Daily', 'Weekly', 'Monthly']
* start_date: Starting date of the query range (inclusive).
* end_date: Ending date of the query range (inclusive), optional if limit is specified.
* limit: The maximum number of time units to return.

Validation: Ensure that the input query parameters provided are valid and make logical sense (e.g., start_date should be before end_date) using yup schema validation.

