from fastapi import FastAPI, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from typing import Literal, List

import os
import json

from src.get import *
from src.post import *
from deps.auth import *
from utils.jwt import verify_token, create_access_token

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://alfred-phone-bridge.onrender.com"],
    allow_origins=["https://route-dashboard.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class registerRequest(BaseModel):
    name: str
    surname: str
    login: str
    password: str
    is_admin: bool

class loginRequest(BaseModel):
    login: str
    password: str

class editUserRequest(BaseModel):
    user_id: int
    login: str
    name: str
    surname: str
    is_admin: bool

class deleteUserRequest(BaseModel):
    user_id: int

class searchUsersRequest(BaseModel):
    q: str = Field(..., min_length=2)

class setUserRequest(BaseModel):
    user_id: int
    trip_id: int

class addCityRequest(BaseModel):
    city: str

class searchCityRequest(BaseModel):
    q: str = Field(..., min_length=2)

class searchCityStationRequest(BaseModel):
    q: str = Field(..., min_length=2)
    city_id: int

class deleteCityRequest(BaseModel):
    city_id: int

class cityStationsRequest(BaseModel):
    city_id: int

class updateCityStationsRequest(BaseModel):
    city_id: int
    stations: list[dict]

class addRouteRequest(BaseModel):
    from_city: str
    to_city: str

class deleteRouteRequest(BaseModel):
    route_id: int

class filterRoutesRequest(BaseModel):
    sort_by: Literal['asc', 'desc'] = 'desc'
    trips_count_from: int | None = Field(None, ge=0, le=120)
    trips_count_to: int | None = Field(None, ge=0, le=120)
    city_from: str | None = None
    city_to: str | None = None

class PricingItem(BaseModel):
    route_id: int
    from_city_id: int
    to_city_id: int
    price: int

class getRoutePrices(BaseModel):
    route_id: int

class updatePricingRequest(BaseModel):
    pricing: List[PricingItem]

class StationItem(BaseModel):
    city_id: int
    city: str
    station_id: int | None = None
    station: str | None = None
    order: int

class getTripsRequest(BaseModel):
    user_id: int

class addTripRequest(BaseModel):
    city_from: int
    city_to: int
    from_station_id: int
    to_station_id: int
    date: str
    time: str
    max_passengers: int | None = 0
    passenger_ids: list[int] | None = None
    passenger_stations: list | None = None
    stations: list[StationItem] | None = None

class editTripRequest(BaseModel):
    trip_id: int
    city_from: int
    city_to: int
    from_station_id: int
    to_station_id: int
    date: str
    time: str
    max_passengers: int | None = 0
    passenger_ids: list[int] | None = None
    passenger_stations: list | None = None
    stations: list[StationItem] | None = None
    status: str

class deleteTripRequest(BaseModel):
    trip_id: int

class tripStationsRequest(BaseModel):
    trip_id: int

class tripPassengersRequest(BaseModel):
    trip_id: int

class tripSetStatusRequest(BaseModel):
    trip_id: int
    status: str

class FilterTripsRequest(BaseModel):
    user_id: int
    sort_by: Literal['asc', 'desc'] = 'desc'
    date_from: str | None = None
    date_to: str | None = None
    time_from: str | None = None
    time_to: str | None = None
    status: List[Literal['planned', 'active', 'completed', 'cancelled']] | None = None
    city_from: str | None = None
    city_to: str | None = None
    station_city: str | None = None
    has_free_seats: bool | None = None
    passengers_from: int | None = Field(None, ge=0)
    passengers_to: int | None = Field(None, ge=0)

class addPassengerRequest(BaseModel):
    name: str
    surname: str
    phone: str
    date_of_birth: str
    trip_id: int | None = None
    note: str | None = None

class editPassengerRequest(BaseModel):
    passenger_id: int
    name: str
    surname: str
    phone: str
    date_of_birth: str
    note: str | None = None

class deletePassengerRequest(BaseModel):
    passenger_id: int

class searchPassengersRequest(BaseModel):
    q: str = Field(..., min_length=2)

class filterPassengersRequest(BaseModel):
    sort_by: Literal['asc', 'desc'] = 'desc'
    age_from: int | None = Field(None, ge=0, le=120)
    age_to: int | None = Field(None, ge=0, le=120)
    city_from: str | None = None
    city_to: str | None = None

class passengerTripsRequest(BaseModel):
    passenger_id: int

class writeToJournalRequest(BaseModel):
    user_id: int
    entity_type: str
    action: Literal['create', 'edit', 'delete']
    description: str

class getTicketPriceRequest(BaseModel):
    trip_id: int
    passanger_id: int
    city_id: int

@app.get("/")
async def root():
    return {"message": "Database service is running"}



@app.post("/auth/refresh")
def refresh(request: Request):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(401, "No refresh token")

    payload = verify_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(403, "Invalid refresh token")

    settings = get_settings()

    new_access_token = create_access_token(
        {
            "sub": payload["sub"],
            "role": payload["role"],
            "type": "access"
        },
        int(settings["security"]["access_ttl"])
    )

    return {
        "access_token": new_access_token
    }



@app.post("/user/register")
def register(req: registerRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_register(req)

@app.post("/user/login")
def login(req: loginRequest):
    return post_login(req)

@app.get("/user/profile")
def profile(user=Depends(get_current_user)):
    return user

@app.post("/user/edit")
def edit_user(req: editUserRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_edit_user(req.user_id, req.login, req.name, req.surname, req.is_admin)

@app.post("/user/delete")
def delete_user(req: deleteUserRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_delete_user(req.user_id)



@app.get("/users")
def users():
    return get_users()

@app.post("/users/search")
def search_users(req: searchUsersRequest):
    return post_search_users(req.q.strip())

@app.post("/users/set")
def set_user(req: setUserRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_set_user(req.user_id, req.trip_id)



@app.get("/settings")
def settings(user=Depends(get_current_user)):    
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return get_settings()

@app.post("/settings/save")
def save_setting(data: dict = Body(...), user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    for key, value in data.get('data').items():
        post_update_setting(key, value)
    
    return {"status": "ok"}

@app.get("/settings/load")
def load_settings():
    
    return get_load_settings()



@app.get("/cities")
async def cities():
    return get_cities()

@app.get("/cities/count")
async def cities_count():
    return get_cities_count()

@app.post("/cities/add")
async def add_city(req: addCityRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_add_city(req.city)

@app.post("/cities/search")
async def search_cities(req: searchCityRequest):
    return post_search_cities(q = req.q.strip())

@app.post("/cities/search/station")
async def search_city_station(req: searchCityStationRequest):
    return post_search_citie_station(q = req.q.strip(), city_id = req.city_id)

@app.post("/cities/delete")
async def delete_city(req: deleteCityRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_delete_city(req.city_id)

@app.post("/cities/stations")
async def city_stations(req: cityStationsRequest):
    return post_city_stations(req.city_id)

@app.post("/cities/stations/update")
async def update_city_stations(req: updateCityStationsRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_update_city_stations(req.city_id, req.stations)



@app.get("/routes")
async def routes():
    return get_routes()

@app.get("/routes/count")
async def routes_count():
    return get_routes_count()

@app.get("/routes/popular")
async def popular_routes():
    return get_popular_routes()

@app.post("/routes/add")
async def add_route(req: addRouteRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    if req.from_city == req.to_city:
        return 'similar'

    res = post_add_route(req.from_city, req.to_city)

    return res

@app.post("/routes/pricing")
async def get_route_prices(req: getRoutePrices):
    return post_get_route_prices(req.route_id)

@app.post("/routes/pricing/update")
async def update_pricing(req: updatePricingRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_update_pricing(req.pricing)

@app.post("/routes/delete")
async def delete_route(req: deleteRouteRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    success = post_delete_route(req.route_id)

    if not success or success == 'route has trips':
        return {"success": False, "message": success}

    return {"success": True, "message": success}

@app.post("/routes/filter")
async def filter_routes(req: filterRoutesRequest):
    if req.trips_count_from and req.trips_count_to and req.trips_count_from > req.trips_count_to:
        return {
            "error": "trips_count_from cannot be greater than trips_count_to"
        }
    
    res = post_filter_routes(req.sort_by, req.trips_count_from, req.trips_count_to, req.city_from, req.city_to)

    return res



@app.post("/trips")
async def trips(req: getTripsRequest):
    return post_get_trips(req.user_id)

@app.get("/trips/count")
async def trips_count():
    return get_trips_count()

@app.post("/trips/add")
async def add_trip(req: addTripRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    max_passengers = 0 if req.max_passengers == None else req.max_passengers

    success = post_add_trip(req.city_from, req.city_to, req.from_station_id, req.to_station_id, req.date, req.time, max_passengers, req.passenger_ids, req.passenger_stations, req.stations)

    if success == 'added':
        return {"success": True, "message": success}
        
    return {"success": False, "message": success}

@app.post("/trips/edit")
async def edit_trip(req: editTripRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    success = post_edit_trip(req.trip_id, req.city_from, req.city_to, req.from_station_id, req.to_station_id, req.date, req.time, req.max_passengers, req.passenger_ids, req.passenger_stations, req.stations, req.status)

    if not success or success != 'edited':
        return {"success": False, "message": success}

    return {"success": True, "message": success}

@app.post("/trips/delete")
async def delete_trip(req: deleteTripRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    success = post_delete_trip(req.trip_id)

    return {"success": True, "message": success}

@app.post("/trips/stations")
async def trip_stations(req: tripStationsRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_trip_stations(req.trip_id)

@app.post("/trips/passengers")
async def trip_passengers(req: tripPassengersRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    return post_trip_passengers(req.trip_id)

@app.post("/trips/status/set")
async def trip_set_status(req: tripSetStatusRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    success = post_trip_set_status(req.trip_id, req.status)

    return {"success": success}

@app.post("/trips/filter")
async def filter_trips(req: FilterTripsRequest):
    if req.passengers_from and req.passengers_to:
        if req.passengers_from > req.passengers_to:
            return {"error": "passengers_from cannot be greater than passengers_to"}

    return post_filter_trips(req)



@app.get("/passengers")
async def passengers():
    return get_passengers()

@app.get("/passengers/count")
async def passengers_count():
    return {"count": get_passengers_count()}

@app.post("/passengers/add")
async def add_passenger(req: addPassengerRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    if req.phone.replace('+', '').isdigit():
        phone = ''.join(filter(str.isdigit, req.phone))

    note = None if req.note == '' else req.note
    res = post_add_passenger(req.name, req.surname, phone, req.date_of_birth, req.trip_id, note)

    return {"result": res}

@app.post("/passengers/edit")
async def edit_passenger(req: editPassengerRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    if req.phone.replace('+', '').isdigit():
        phone = ''.join(filter(str.isdigit, req.phone))

    note = None if req.note == '' else req.note
    res = post_edit_passenger(req.passenger_id, req.name, req.surname, phone, req.date_of_birth, note)

    return {"result": res}

@app.post("/passengers/delete")
async def delete_passenger(req: deletePassengerRequest, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403)
    
    success = post_delete_passenger(req.passenger_id)

    if not success:
        return {"success": False, "message": "Passenger not found"}

    return {"success": True}

@app.post("/passengers/search")
async def search_passengers(req: searchPassengersRequest):
    q = req.q.strip()

    if len(q) < 2:
        return []

    if q.replace('+', '').isdigit():
        phone = ''.join(filter(str.isdigit, q))
        res = post_search_passengers(phone=phone)
    else:
        # імʼя / прізвище
        parts = q.split()
        name = parts[0]
        surname = parts[1] if len(parts) > 1 else None

        res = post_search_passengers(
            name=name,
            surname=surname
        )

    return res

@app.post("/passengers/filter")
def filter_passengers(req: filterPassengersRequest):
    if req.age_from and req.age_to and req.age_from > req.age_to:
        return {
            "error": "age_from cannot be greater than age_to"
        }
    
    res = post_filter_passengers(req.sort_by, req.age_from, req.age_to, req.city_from, req.city_to)

    return res

@app.post("/passengers/trips")
def passenger_trips(req: passengerTripsRequest):
    return post_passenger_trips(req.passenger_id)



@app.get("/journal")
def journal():
    return get_journal()

@app.post("/journal/write")
def write(req: writeToJournalRequest):
    return post_write(req.user_id, req.entity_type, req.action, req.description)

@app.get("/journal/clear")
def clear_journal():
    return get_clear_journal()



@app.post("/ticket/price")
def get_ticket_price(req: getTicketPriceRequest):
    return post_get_ticket_price(req.trip_id, req.passanger_id, req.city_id)