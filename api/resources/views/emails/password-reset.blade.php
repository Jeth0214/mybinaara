<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1c2536;">
    <p>Hi {{ $user->name }},</p>

    <p>
        We received a request to reset the password for your MyBinaara account.
        Click the link below to choose a new password.
    </p>

    <p>
        <a href="{{ $resetUrl }}">Reset your password</a>
    </p>

    <p>This link expires on {{ $expiresAt->format('F j, Y \a\t g:i A') }} ({{ $expiresAt->diffForHumans() }}).</p>

    <p>If you didn't request this, you can safely ignore this email.</p>
</body>
</html>
