$(document).ready(function () {
  // Load roles dynamically
  $.ajax({
    url: "/roles/api",
    method: "GET",
    dataType: "json",
    success: function (roles) {
      let rows = "";
      if (roles.length > 0) {
        roles.forEach((role, index) => {
          const isActive = role.active
            ? '<i class="fas fa-check text-success"></i>'
            : '<i class="fas fa-times text-danger"></i>';
          rows += `
            <tr>
              <td>${index + 1}</td>
              <td>${role.name || "N/A"}</td>
              <td>${isActive}</td>
              <td>${role.description || "N/A"}</td>
              <td>
                <a class="btn btn-info btn-sm" href="/roles/${role.id}/edit">
                  <i class="fas fa-pencil-alt"></i> Edit
                </a>
                <button class="btn btn-danger btn-sm btn-delete-role" data-id="${
                  role.id
                }">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          `;
        });
      } else {
        rows = `<tr><td colspan="5" class="text-center text-muted">No roles found.</td></tr>`;
      }
      $("#rolesTableBody").html(rows);

      // Initialize DataTable
      $("#rolesTable").DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: false,
        info: true,
        autoWidth: false,
        responsive: true,
        pageLength: 5,
        lengthMenu: [
          [5, 10, 25, 50],
          [5, 10, 25, 50],
        ],
        language: {
          lengthMenu: "_MENU_",
          searchPlaceholder: "Search roles...",
        },
        dom:
          "<'d-flex align-items-center justify-content-between flex-wrap mb-2 mt-2'<'custom-title'><'d-flex align-items-center ml-auto' f l <'custom-addrole'>>>" +
          "rt" +
          "<'row'<'col-md-6'i><'col-md-6'p>>",
      });

      $("#rolesTable_wrapper .custom-title").html(
        '<h3 class="card-title m-3">All Roles</h3>'
      );
      $("#rolesTable_wrapper .custom-addrole").html(`
        <a href="/addrole" class="btn btn-primary mr-3 ml-2 mb-2">
          <i class="nav-icon fas fa-plus"></i> Add Role
        </a>
      `);
    },
    error: function () {
      $("#rolesTableBody").html(
        `<tr><td colspan="5" class="text-center text-danger">Error loading roles.</td></tr>`
      );
    },
  });

  // Delete handler (event delegation)
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-delete-role")) {
      const button = e.target.closest(".btn-delete-role");
      const roleId = button.getAttribute("data-id");

      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        buttons: ["Cancel", "Yes, delete it!"],
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          fetch(`/roles/${roleId}/delete`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          })
            .then((response) => {
              if (response.redirected) {
                swal("Deleted!", "The role has been deleted.", "success").then(
                  () => {
                    window.location.href = response.url;
                  }
                );
              } else {
                return response.text();
              }
            })
            .catch((err) => {
              console.error("Error deleting role:", err);
              swal("Error", "Failed to delete role.", "error");
            });
        }
      });
    }
  });
});

$(document).ready(function () {
  $.ajax({
    url: "/api/users",
    method: "GET",
    dataType: "json",
    success: function (users) {
      let rows = "";
      if (users.length > 0) {
        users.forEach((user, index) => {
          const dob = user.dob
            ? new Date(user.dob).toLocaleDateString()
            : "N/A";
          rows += `
            <tr>
              <td>${index + 1}</td>
              <td>
                <div class="d-flex align-items-center">
                  <img src="/src/assets/image/uploads/${
                    user.image || "profile-user.png"
                  }"
                       class="img-circle elevation-2"
                       style="width:40px;height:40px;object-fit:cover;margin-right:10px;">
                  <div><strong>${user.name || "N/A"}</strong></div>
                </div>
              </td>
              <td>
                <strong>${user.email || "N/A"}</strong><br>
                <small>${user.phone_no || "N/A"}</small>
              </td>
              <td>${user.username || "N/A"}</td>
              <td>${dob}<br>${user.gender || "N/A"}</td>
              <td>${user.hobby || "N/A"}</td>
              <td>${user.role_name || "N/A"}</td>
              <td>
                <a class="btn btn-info btn-sm" href="/edituser/${user.id}">
                  <i class="fas fa-pencil-alt"></i> Edit
                </a>
                <button class="btn btn-danger btn-sm btn-delete" data-id="${
                  user.id
                }">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          `;
        });
      } else {
        rows = `<tr><td colspan="8" class="text-center text-muted">No users found.</td></tr>`;
      }
      $("#usersTableBody").html(rows);

      $("#usersTable").DataTable({
        paging: true,
        lengthChange: true,
        searching: true,
        ordering: false,
        info: true,
        autoWidth: false,
        responsive: true,
        pageLength: 5,
        lengthMenu: [
          [5, 10, 25, 50],
          [5, 10, 25, 50],
        ],
        language: {
          lengthMenu: "_MENU_",
          searchPlaceholder: "Search users...",
        },
        dom:
          "<'d-flex align-items-center justify-content-between flex-wrap mb-2 mt-2'<'custom-title'><'d-flex align-items-center ml-auto' f l <'custom-adduser'>>>" +
          "rt" +
          "<'row'<'col-md-6'i><'col-md-6'p>>",
      });

      $("#usersTable_wrapper .custom-title").html(
        '<h3 class="card-title m-3">All Registered Users</h3>'
      );
      $("#usersTable_wrapper .custom-adduser").html(`
        <a href="/adduser" class="btn btn-primary mr-3 mb-2">
          <i class="nav-icon fas fa-user-plus"></i> Add User
        </a>
      `);
    },
    error: function () {
      $("#usersTableBody").html(
        `<tr><td colspan="8" class="text-center text-danger">Error loading users.</td></tr>`
      );
    },
  });
});

// DELETE handler
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-delete")) {
    const button = e.target.closest(".btn-delete");
    const userId = button.getAttribute("data-id");

    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: ["Cancel", "Yes, delete it!"],
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        fetch(`/deleteuser/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        })
          .then((response) => {
            if (response.redirected) {
              swal("Deleted!", "The user has been deleted.", "success").then(
                () => {
                  window.location.href = response.url;
                }
              );
            } else {
              return response.text();
            }
          })
          .catch((err) => {
            console.error("Error deleting user:", err);
            swal("Error", "Failed to delete user.", "error");
          });
      }
    });
  }
});
