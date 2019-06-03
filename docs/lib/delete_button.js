'use strict';

document.addEventListener('DOMContentLoaded', function () {
  (document.querySelectorAll('.notification .delete') || []).forEach(function ($delete) {
    $notification = $delete.parentNode;
    $delete.addEventListener('click', function () {
      $notification.parentNode.removeChild($notification);
    });
  });
});