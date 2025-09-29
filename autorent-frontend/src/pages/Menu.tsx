// src/pages/Menu.tsx
// Menú posterior al login. Botón que abre Vehículos en nueva pestaña.

import React from 'react';

export default function MenuPage() {
  function openVehiculos() {
    window.open('/#/vehiculos', '_blank');
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Menú</h1>
        <p style={{ color: '#9ca3af', marginTop: 8 }}>
          Selecciona una opción para continuar.
        </p>

        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          <button style={styles.button} onClick={openVehiculos}>
            Vehículos
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a' },
  card: { width: 420, background: '#111827', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,.3)', color: '#e5e7eb' },
  button: { padding: '12px 14px', borderRadius: 10, background: '#2563eb', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' },
};
