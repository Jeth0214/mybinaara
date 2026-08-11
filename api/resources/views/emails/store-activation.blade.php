<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1c2536;">
    <p>Hi {{ $owner->name }},</p>

    <p>
        Your store <strong>{{ $store->name }}</strong> has been registered on MyBinaara.
        Use the temporary password below along with the activation link to set up your account.
    </p>

    <p>
        <strong>Email:</strong> {{ $owner->email }}<br>
        <strong>Temporary password:</strong> {{ $temporaryPassword }}
    </p>

    <p>
        <a href="{{ $activationUrl }}">Activate your store account</a>
    </p>

    <p>This link expires on {{ $expiresAt->format('F j, Y \a\t g:i A') }} ({{ $expiresAt->diffForHumans() }}).</p>
</body>
</html>
