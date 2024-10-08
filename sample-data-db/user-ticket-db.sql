CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phoneno VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('passenger', 'conductor'))
);

CREATE TABLE tickets (
    ticket_unique_identifier UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_time TIMESTAMP NOT NULL,
    trip_details JSONB NOT NULL, -- Structure: {"bus_id": ..., "source_stop_id": ..., "destination_stop_id": ..., "total_distance": ..., "price_per_km": ..., "no_of_passengers": ..., "fare": ...}
    validated_time TIMESTAMP,
    payment_status VARCHAR(255) NOT NULL DEFAULT 'IN-PROGRESS',
    order_id VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
