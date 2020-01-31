
function onLoad() {

    //Get the modal that opens when click on "إضافة فئة"
    let modal = document.getElementById("createcategory-modal");

    //Get the create button that will craete a new category 
    let createBtn = document.getElementById("createcategory-btn");

    //When the user clicks on "انشاء", update actegories tabel with new category
    let addForm = document.getElementById("category-form");
    let editForm = document.getElementById("category-edit-form");

    editForm.addEventListener("submit", (e) => {

        updateCategoryName();
        hideModals("createcategory-edit-modal");
        e.preventDefault();
        return false;
    });

    addForm.addEventListener("submit", (e) => {

        let tbody = document.getElementsByTagName('tbody')[0];
        let categoryName = document.getElementById("categoryname").value;
        let tr = document.createElement('tr');
        tr.style.height = "28px";
        let row = `
        <td class="user_no" >${tbody.childElementCount + 1}</td>
        <td class="user_full">
            <span class="user_name" $style="'font-size:18px':true">` + categoryName + `</span>
        </td>
        <td>
            <select class="selection" style="font-size:18px; border:none; font-family:"Segoe UI"">
                <option value="writer">فعال</option>
                <option value="admin"> غير فعال</option>
            </select>
        </td>
        <td>
            <i class="fas fa-trash-alt delete_user" style="font-size:20px; color:red; text-align:center; cursor:pointer" onclick="show(this,'delete',${categories.length + 1})"></i>
            <i class="far fa-edit icon color-blue" onclick="showEditModal('createcategory-edit-modal',this,${categories.length + 1})"></i>
        </td>`;
        tr.innerHTML = row;
        tr.className = 'user_info';
        tbody.appendChild(tr);
        hideModals(modal.id);
        // to database
        categories.push({
            isActive: 1,
            id: categories.length + 1,
            name: "categoryName"
        })

        e.preventDefault();
        return false;
    });

    //When the user clicks anywhere outside of the modal, close it 
    window.onclick = function (event) {
        if (event.target == modal) {
            this.hideModals(modal.id);
        }
    }
}

export { onLoad };