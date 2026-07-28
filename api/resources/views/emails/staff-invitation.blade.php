<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1c2536;">
    <p>Hi {{ $staff->name }},</p>

    <p>
        You have been invited to the MyBinaara admin portal. Use the link below to set up
        your password and log in.
    </p>

    <p>
        <a href="{{ $invitationUrl }}">Accept your invitation</a>
    </p>

    <p>This link expires in 7 days.</p>
</body>
</html>
