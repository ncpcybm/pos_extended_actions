function update_pricing(s_item, d_amount, b_is_decrease_value, d_percent_value) {
    frappe.db.get_single_value("Michalis Diamond Gallery Settings", "round_to_nearest_10").then((res) => {

        alert(res)
        
        frappe.call({
            method: 'michalis_diamond_gallery.api.perform_item_bulk_action',
            args: {
                item: s_item,
                percent_value: d_percent_value,
                fixed_value: d_amount,
                decrease: b_is_decrease_value,
                round: res
            },
            callback: function (response) {
                if (response.message) {
                    frappe.msgprint(__('Bulk action performed on {0} items.', [response.message]));
                }
            }
        });
    })
}

function request_data(selected_items, mode) {
    // mode => 0 -> normal increase/decrese 
    // mode => 1 -> percent increase/decrease

    let items = Array()

    let d = new frappe.ui.Dialog({
        title: 'Enter details',
        fields: [
            {
                label: 'Amount',
                fieldname: 'amount',
                fieldtype: 'Float'
            },
            {
                label: 'Is decrease',
                fieldname: 'is_decrease_value',
                fieldtype: 'Check'
            }
        ],
        size: 'small', // small, large, extra-large 
        primary_action_label: 'Submit',
        primary_action(values) {

            console.log(values);

            if (selected_items.length >= 1) {
                frappe.msgprint(__('Performing custom action on selected items...'));

                if (selected_items.length > 0) {
                    selected_items.forEach(el => {
                        items.push(el.item_code)
                    })

                    // update_pricing(s_item, d_amount, b_is_decrease_value, d_percent_value) 

                    if (mode === 0) {
                        if (items.length >= 1) {
                            for (let index = 0; index < items.length; index++) {
                                update_pricing(items[index], values.amount, values.is_decrease_value, 0)
                            }
                        }
                    }
                    else {
                        if (items.length >= 1) {
                            for (let index = 0; index < items.length; index++) {
                                update_pricing(items[index], 0, values.is_decrease_value, values.amount)
                            }
                        }
                    }
                } else {
                    frappe.msgprint(__('Please select at least one item.'));
                }

            } else {
                frappe.msgprint(__('Please select at least one item.'));
            }

            d.hide();
        }
    });

    d.show();
}


frappe.listview_settings['Item'] = {
    add_fields: ['item_code', 'item_name'],  // Optional: define the fields to show in the list view

    onload: function (listview) {
        listview.page.add_action_item(__('Increase/Decrese by x - Amount'), function () {
            let selected_items = listview.get_checked_items();

            request_data(selected_items, 0)
        });


        listview.page.add_action_item(__('Increase/Decrese by x% - Percent'), function () {
            let selected_items = listview.get_checked_items();
            request_data(selected_items, 1)
        });

    }
};
