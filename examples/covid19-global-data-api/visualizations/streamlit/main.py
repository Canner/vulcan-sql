import datetime

import requests
import streamlit as st
import pandas as pd
import plotly.express as px


st.set_page_config(page_title='COVID-19 Data Visualizations', layout='wide')

API_URL = 'http://localhost:3000/api'

st.title('COVID-19 Data Visualizations')
st.markdown('The API service is delivered using [VulcanSQL](https://vulcansql.com/).')

@st.cache_data
def get_country_name_and_code_pairs():
    countries_api_url = f'{API_URL}/countries'
    return list(
        map(
            lambda v: f"{v['Country']} - {v['Country_code']}",
            requests.get(countries_api_url).json()
        )
    )

start_date_input = st.date_input('Start Date', value=datetime.date(2023, 1, 1))
end_date_input = st.date_input('End Date', value=None)

col1, col2 = st.columns(2)
with col1:
    st.markdown('### Maximum cases in the world')

    max_cases_api_url = f'{API_URL}/max_cases'
    max_cases_results = requests.get(
        max_cases_api_url,
        params={
            'start_date': start_date_input,
            'end_date': end_date_input,
            'top_n': 10
        }
    )
    assert max_cases_results.status_code == 200
    max_cases_df = pd.DataFrame(max_cases_results.json())
    st.dataframe(max_cases_df)
with col2:
    st.markdown('### Maximum deaths in the world')

    max_deaths_api_url = f'{API_URL}/max_deaths'
    max_deaths_results = requests.get(
        max_deaths_api_url,
        params={
            'start_date': start_date_input,
            'end_date': end_date_input,
            'top_n': 10
        }
    )
    assert max_deaths_results.status_code == 200
    max_deaths_df = pd.DataFrame(max_deaths_results.json())
    st.dataframe(max_deaths_df)

st.markdown('### New cases and deaths from the selected countries')

country_code_input_pairs = st.multiselect('Select Countries', get_country_name_and_code_pairs())
country_codes = list(map(lambda v: v.split(' - ')[1], country_code_input_pairs))

if country_codes:
    reports_api_url = f'{API_URL}/reports'
    reports_results = requests.get(
        reports_api_url,
        params={
            'start_date': start_date_input,
            'end_date': end_date_input,
            'country_code': country_codes
        }
    )
    assert reports_results.status_code == 200

    df = pd.DataFrame(reports_results.json())
    df['Date_reported'] = pd.to_datetime(df['Date_reported'])

    fig1 = px.line(
        df,
        x='Date_reported',
        y='New_cases',
        title=f'New cases in {", ".join(country_code_input_pairs)}',
        color='Country_code'
    )
    st.plotly_chart(fig1, use_container_width=True)

    fig2 = px.line(
        df,
        x='Date_reported',
        y='New_deaths',
        title=f'New deaths in {", ".join(country_code_input_pairs)}',
        color='Country_code'
    )
    st.plotly_chart(fig2, use_container_width=True)