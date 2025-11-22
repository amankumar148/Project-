// js/index.js
const API_BASE_URL = 'http://localhost:5000/api/students'; // Base API URL
let currentPage = 1;
const pageSize = 10; // Records per page

$(document).ready(function() {
    // 1. Initial Load
    loadStudents(currentPage);

    // 2. Attach Delete Handler (using event delegation for dynamically created buttons)
    $('#studentTableBody').on('click', '.delete-btn', function() {
        const studentId = $(this).data('id');
        showDeleteConfirmation(studentId);
    });
});

// Function to fetch and display student data
function loadStudents(page) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // Auth Guard should handle this, but good to double-check
        return; 
    }

    $.ajax({
        url: `${API_BASE_URL}?pageNumber=${page}&pageSize=${pageSize}`,
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            currentPage = page;
            renderTable(response.data);
            renderPagination(response.totalRecords, response.totalPages);
        },
        error: function(xhr) {
            Swal.fire('Error', 'Could not load student data. Please log in again.', 'error');
            // Optionally redirect to login if 401 Unauthorized
        }
    });
}

// Function to dynamically build the table rows
function renderTable(students) {
    const tbody = $('#studentTableBody');
    tbody.empty(); // Clear existing rows

    if (students.length === 0) {
        tbody.append('<tr><td colspan="8" class="text-center">No student records found.</td></tr>');
        return;
    }

    students.forEach(student => {
        // Format subjects (assuming 'Subjects' is an array of objects like {SubjectName: "Math", Marks: 90})
        const subjectsHtml = student.Subjects
            .map(s => `<li>${s.SubjectName} (${s.Marks})</li>`)
            .join('');

        // Format photos (assuming 'Photos' is a JSON string of paths/base64)
        const photosArray = JSON.parse(student.Photos || '[]');
        const photoHtml = photosArray.length > 0 
            ? `<img src="${photosArray[0]}" alt="Photo" style="width: 50px; height: 50px; object-fit: cover;">` // Show first photo
            : 'N/A';
        
        const row = `
            <tr>
                <td>${student.Name}</td>
                <td>${student.Age}</td>
                <td>${student.Address || 'N/A'}</td>
                <td>${student.StateName}</td>
                <td>${student.PhoneNumber}</td>
                <td>${photoHtml}</td>
                <td><ul class="list-unstyled">${subjectsHtml}</ul></td>
                <td>
                    <a href="edit.html?id=${student.StudentID}" class="btn btn-sm btn-info edit-btn">Edit</a>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${student.StudentID}">Delete</button>
                </td>
            </tr>
        `;
        tbody.append(row);
    });
}

// Function to handle the Sweet Alert Delete confirmation
function showDeleteConfirmation(studentId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            performDelete(studentId);
        }
    });
}

// Function to call the backend DELETE API
function performDelete(studentId) {
    const token = localStorage.getItem('jwtToken');
    
    $.ajax({
        url: `${API_BASE_URL}/${studentId}`,
        type: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function() {
            Swal.fire(
                'Deleted!',
                'The student record has been deleted.',
                'success'
            );
            // Reload the current page of data
            loadStudents(currentPage); 
        },
        error: function() {
            Swal.fire('Error', 'Failed to delete the record.', 'error');
        }
    });
}

// Function to render pagination controls
function renderPagination(totalRecords, totalPages) {
    const pagination = $('#paginationControls');
    pagination.empty();

    if (totalPages <= 1) return;

    // Previous button
    pagination.append(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `);

    // Page links
    for (let i = 1; i <= totalPages; i++) {
        pagination.append(`
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }

    // Next button
    pagination.append(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `);

    // Attach click handler to page links
    pagination.off('click', 'a.page-link').on('click', 'a.page-link', function(e) {
        e.preventDefault();
        const newPage = parseInt($(this).data('page'));
        if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
            loadStudents(newPage);
        }
    });
}