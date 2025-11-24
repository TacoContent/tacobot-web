$(function() {
  const $redeemModal = $('#redeem-modal');
  let currentTicket = null;

  $('.btn-redeem').on('click', function() {
    const $btn = $(this);
    currentTicket = {
      guildId: $btn.data('guild-id'),
      username: $btn.data('username'),
      ticketCode: $btn.data('ticket-code')
    };
    $redeemModal.modal('show');
  });

  $redeemModal.find('[data-modal-confirm]').on('click', function() {
    if (!currentTicket) return;

    $.ajax({
      url: '/pulltabs/redeem',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(currentTicket),
      success: function(response) {
        toastr.success(response.message || 'Ticket redeemed successfully!');
        // Optionally reload or update UI
        setTimeout(() => location.reload(), 5000);
      },
      error: function(xhr) {
        toastr.error(xhr.responseJSON?.error || 'Failed to redeem ticket.');
      }
    });
  });
});
