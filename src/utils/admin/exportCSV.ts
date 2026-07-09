export function exportCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return
  const headers = Object.keys(data[0] ?? {})
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ""
        const str = String(val)
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(",")
    ),
  ].join("\n")

  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
