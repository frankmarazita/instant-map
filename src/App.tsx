"use client";

import { id, init, tx } from "@instantdb/react";
import ClipLoader from "react-spinners/ClipLoader";

import Map, { MapRef, Marker } from "react-map-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { useRef } from "react";

const APP_ID = "57079df8-619e-4250-a8c4-42db4a463cda";

type Task = {
  id: string;
  text: string;
  createdAt: number;
  location?: {
    lat: number;
    lng: number;
  };
};

type Schema = {
  task: Task;
};

const db = init<Schema>({ appId: APP_ID });

function createTask(text: string, location?: { lat: number; lng: number }) {
  const task: Task = {
    id: id(),
    text,
    createdAt: Date.now(),
    location,
  };

  db.transact(tx.task[id()].update(task));
}

function deleteTask(id: string) {
  db.transact(tx.task[id].delete());
}

function App() {
  const { isLoading, error, data } = db.useQuery({ task: {} });

  const mapRef = useRef<MapRef>(null);

  if (isLoading) {
    return (
      <div
        style={
          {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          } as React.CSSProperties
        }
      >
        <ClipLoader color="#000" speedMultiplier={3} />
      </div>
    );
  }

  if (error) {
    console.error(error);
    return <div>An error occurred!</div>;
  }

  const taskMarkers = data.task.map((task) => {
    if (!task.location) {
      return null;
    }

    return (
      <Marker
        key={task.id}
        longitude={task.location.lng}
        latitude={task.location.lat}
        anchor="bottom"
      >
        <div
          style={{
            background: "white",
            padding: 10,
            borderRadius: 5,
            border: "1px solid black",
            alignItems: "center",
            width: 10,
            height: 10,
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
            // hover effect change background color
          }}
          onClick={() => deleteTask(task.id)}
        >
          <div>X</div>
        </div>
      </Marker>
    );
  });

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiZm1hcmF6aXRhIiwiYSI6ImNsbmc4b2xrNjB0MDMya3F4M3Ztejk1YmYifQ.TGq4QOgaCQs6a_kkF9JweA"
        initialViewState={{
          longitude: -100,
          latitude: 40,
          zoom: 3.5,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
      >
        {taskMarkers}

        {/* add a new task */}
        <button
          style={{ position: "absolute", top: 10, right: 10 }}
          onClick={() => createTask("New task", mapRef.current?.getCenter())}
        >
          Add Task
        </button>
      </Map>
    </div>
  );
}

export default App;
