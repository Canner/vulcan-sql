# COVID 19 Global Data API

## Project Introduction

This sample project is based on [VulcanSQL](https://github.com/Canner/vulcan-sql/). VulcanSQL is a Data API Framework that helps data folks build scalable data APIs using only SQL templates without any backend skills required.

In this project, we expose some apis based on COVID 19 Global Data downloaded from [WHO Coronavirus (COVID-19) Dashboard](https://covid19.who.int/data), and `WHO-COVID-19-global-data.csv` is the downloaded file.

## Setup

- [Install VulcanSQL from NPM](https://vulcansql.com/docs/get-started/installation#install-from-npm)
- `npm install` in the root of project directory
- `vulcan start --watch` and `vulcan catalog` in two seperate shell windows, and you can now access API documentation at `http://localhost:3000/docs` and catalog at `http://localhost:4000`

## APIs introduction

- `/countries`: get a list of countries and their country codes
- `/max_cases`: get a list of countries or WHO regions that have the most cases on a given date range
- `/max_deaths`: get a list of countries or WHO regions that have the most deaths on a given date range
- `/min_cases`: get a list of countries or WHO regions that have the minimum cases on a given date range
- `/min_deaths`: get a list of countries or WHO regions that have the minimum deaths on a given date range
- `/reports`: get a list of COVID-19 reports by countries and date range
- `/who_regions`: get a list of WHO regions

## Data introduction

|Field name|Type|Description|
|---|---|---|
|Date_reported|Date|Date of reporting to WHO|
|Country_code|String|ISO Alpha-2 country code|
|Country|String|Country, territory, area|
|WHO_region|String|WHO regional offices: WHO Member States are grouped into six WHO regions -- Regional Office for Africa (AFRO), Regional Office for the Americas (AMRO), Regional Office for South-East Asia (SEARO), Regional Office for Europe (EURO), Regional Office for the Eastern Mediterranean (EMRO), and Regional Office for the Western Pacific (WPRO).|
|New_cases|Integer|New confirmed cases. Calculated by subtracting previous cumulative case count from current cumulative cases count.|
|Cumulative_cases|Integer|Cumulative confirmed cases reported to WHO to date.|
|New_deaths|Integer|New confirmed deaths. Calculated by subtracting previous cumulative deaths from current cumulative deaths.|
|Cumulative_deaths|Integer|Cumulative confirmed deaths reported to WHO to date.|

## Data Visualizations

- [Streamlit](visualizations/streamlit/)
