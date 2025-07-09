import styles from "./measurementInputs.module.css";

export default function MeasurementInputs({ category, measurements, setMeasurements }) {
  const handleChange = (e) => {
    setMeasurements((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const renderTop = () => (
    <>
      <label>어깨</label>
      <input name="shoulder" value={measurements.shoulder || ""} onChange={handleChange} />

      <label>가슴</label>
      <input name="chest" value={measurements.chest || ""} onChange={handleChange} />

      <label>총장</label>
      <input name="length" value={measurements.length || ""} onChange={handleChange} />

      <label>소매</label>
      <input name="sleeve" value={measurements.sleeve || ""} onChange={handleChange} />
    </>
  );

  const renderBottom = () => (
    <>
      <label>허리</label>
      <input name="waist" value={measurements.waist || ""} onChange={handleChange} />

      <label>밑위</label>
      <input name="rise" value={measurements.rise || ""} onChange={handleChange} />

      <label>허벅지</label>
      <input name="thigh" value={measurements.thigh || ""} onChange={handleChange} />

      <label>총장</label>
      <input name="length" value={measurements.length || ""} onChange={handleChange} />
    </>
  );

  const renderShoes = () => (
    <>
      <label>사이즈</label>
      <input name="size" value={measurements.size || ""} onChange={handleChange} />
    </>
  );

  return (
    <div className={styles.gridWrapper}>
      {category === "top" && renderTop()}
      {category === "bottom" && renderBottom()}
      {category === "shoes" && renderShoes()}
    </div>
  );
}
