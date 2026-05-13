import RealTimeLocation from "../hooks/useTracking";
import { Button } from "../ui/Button";
import MapComponent from "../ui/maps/map-component";
import styles from './viewStyle.module.css';

const defaultLocation = {
  id: "route-001",
  code: "R-001",
  name: "Ruta Centro - Periferia",
  shortName: "C-P",
  type: "LINEAR",
  status: "ACTIVE",
  color: "#FF5733",
  icon: "bus-icon-1",
  totalDistanceKm: 25.5,
  estimatedDurationMin: 45,
  polyline: "encoded_polyline_string_here",
  boundingBox: {
    ne: {
      lat: 25.668399,
      lng: -103.36755
    },
    sw: {
      lat: 20.668399,
      lng: -103.36755
    }
  }
}

const otherModel = {
  routeId: "route_1778709049062",
  timestamp: "2026-05-13T21:50:49.062Z",
  pointsCount: 1,
  waypoints: [
    {
      id: "1778709049058",
      label: "Punto 1",
      latitude: 20.6673,
      longitude: -103.3634
    }
  ],
  distanceKm: 0,
  status: "incomplete"
}




export default function CustomerView() {
    return (
        <main className={styles.container}>
            {/* <MapComponent latitude={defaultLocation.boundingBox.ne.lat} longitude={defaultLocation.boundingBox.ne.lng}/> */}
            <RealTimeLocation />
            <Button variant="primary" className={styles.floatingButton} onClick={() => alert('Button clicked!')}>Click Me</Button>
        </main>
    );
}