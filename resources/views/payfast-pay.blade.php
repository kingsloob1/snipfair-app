<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="{{$in_sandbox ? 'https://sandbox.payfast.co.za/onsite/engine.js' : 'https://www.payfast.co.za/onsite/engine.js'}}"></script>
    </head>
    <body>
        <script>
            @php
                $query = http_build_query([
                    'uuid' => $uuid,
                    'deposit_id' => $deposit_id,
                    'in_sandbox' => $in_sandbox,
                    'amount' => $amount,
                ]);

                $success_url = URL::to("/api/payment/success/payfast")."?{$query}";
                $cancel_url = URL::to("/api/payment/cancel/payfast")."?{$query}";
                $notify_url = URL::to('/api/payment/webhook/payfast');
            @endphp
            // DO NOT MODIFY THE CODE BELOW

            // retrieve the uuid that is passed to this file and send it to PayFast onsite engine
            var queryString = window.location.search;
            var urlParams = new URLSearchParams(queryString);
            var uuid = '{{ $uuid }}' ? '{{ $uuid }}' : urlParams.get('uuid');
            var depositId = {{ $deposit_id }} ?? urlParams.get('deposit_id');
            var successUrl = '<?php echo $success_url ?>';
            var cancelUrl = '<?php echo $cancel_url ?>';
            var notifyUrl = '<?php echo $notify_url ?>';


            window.payfast_do_onsite_payment({
                "uuid": uuid,
                'return_url': successUrl,
                'cancel_url': cancelUrl,
                'notify_url': notifyUrl
            });
        </script>
    </body>
</html>
