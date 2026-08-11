Hi {!! $user->name !!},

We received a request to reset the password for your MyBinaara account.
Open the link below to choose a new password:

{!! $resetUrl !!}

This link expires on {!! $expiresAt->format('F j, Y \a\t g:i A') !!} ({!! $expiresAt->diffForHumans() !!}).

If you didn't request this, you can safely ignore this email.
