export default function EmptyState({ onAdd, filtered, onClearFilters }) {
  if (filtered) {
    return (
      <div className="idx-card items-center text-center py-16 max-w-md mx-auto">
        <p className="text-3xl mb-3">🔍</p>
        <p className="card-title">ไม่พบพรอมต์ที่ตรงกับตัวกรอง</p>
        <p className="card-snip text-center">ลองปรับคำค้นหาหรือแท็กที่เลือกดูครับ</p>
        <button className="btn mt-2" onClick={onClearFilters}>
          ล้างตัวกรองทั้งหมด
        </button>
      </div>
    )
  }

  return (
    <div className="idx-card items-center text-center py-16 max-w-md mx-auto">
      <p className="text-3xl mb-3">🗂️</p>
      <p className="card-title">คลังของคุณยังว่างอยู่</p>
      <p className="card-snip text-center">เริ่มเก็บพรอมต์แรกของคุณ แล้วติดแท็กเพื่อให้ค้นหาเจอง่ายในภายหลัง</p>
      <button className="btn btn-solid mt-2" onClick={onAdd}>
        + เพิ่มพรอมต์แรก
      </button>
    </div>
  )
}
