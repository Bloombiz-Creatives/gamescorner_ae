// document.addEventListener('DOMContentLoaded', () => {
//     const shopButtons = document.querySelectorAll('.shop-now');

//     shopButtons.forEach(button => {
//         button.addEventListener('click', async (event) => {
//             event.preventDefault();

//             const categoryElement = button.closest('.promotional-banner-item')
//                 .querySelector('.promotional-banner-item__title');
//             const categoryName = categoryElement.textContent.trim();

//             try {
//                 const response = await fetch('http://localhost:5002/api/category');

//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }

//                 const data = await response.json();
//                 const categories = data.categories;

//                 const category = categories.find(
//                     cat => cat.parent_category.toLowerCase() === categoryName.toLowerCase()
//                 );

//                 if (category) {
//                     // Navigate to the category page
//                     window.location.href = `/shop.html?category=${category._id}`;
//                 } else {
//                     console.error('Category not found');
//                     // Fallback to default shop page
//                     window.location.href = '/shop.html';
//                 }
//             } catch (error) {
//                 console.error('Error fetching category data:', error);
//                 alert('Failed to load category data. Please try again later.');
//             }
//         });
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const shopButtons = document.querySelectorAll('.shop-now');

    shopButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();

            const categoryElement = button.closest('.promotional-banner-item')
                .querySelector('.promotional-banner-item__title');
            const categoryName = categoryElement.textContent.trim();

            try {
                const response = await fetch('http://localhost:5002/api/category');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const categories = data.categories;

                // First check if it's a parent category
                let category = categories.find(
                    cat => cat.parent_category.toLowerCase().trim() === categoryName.toLowerCase()
                );

                // If not found as parent category, check subcategories
                if (!category) {
                    category = categories.find(cat => 
                        cat.name.some(subCat => 
                            subCat.value.toLowerCase() === categoryName.toLowerCase()
                        )
                    );
                }

                if (category) {
                    // If it's a gaming chair, find the specific subcategory ID
                    if (categoryName.toLowerCase() === 'gaming chair') {
                        const gamingChairSubcategory = category.name.find(
                            subCat => subCat.value.toLowerCase() === 'gaming chairs'
                        );
                        if (gamingChairSubcategory) {
                            window.location.href = `/shop.html?category=${category._id}&subcategory=${gamingChairSubcategory._id}`;
                            return;
                        }
                    }
                    // For other categories, use the parent category ID
                    window.location.href = `/shop.html?category=${category._id}`;
                } else {
                    console.error('Category not found');
                    window.location.href = '/shop.html';
                }
            } catch (error) {
                console.error('Error fetching category data:', error);
                alert('Failed to load category data. Please try again later.');
            }
        });
    });
});