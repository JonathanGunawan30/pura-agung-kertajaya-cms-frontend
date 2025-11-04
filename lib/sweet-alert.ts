import Swal from "sweetalert2"

export const showSuccessAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#16a34a",
    confirmButtonText: "OK",
  })
}

export const showErrorAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#dc2626",
    confirmButtonText: "OK",
  })
}

export const showConfirmAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#dc2626", 
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  })
}

export const showLoadingAlert = (title: string) => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  })
}

export const closeAlert = () => Swal.close()