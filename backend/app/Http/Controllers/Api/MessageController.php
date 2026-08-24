<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Get all conversations (unique user pairs)
        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver', 'listing'])
            ->latest()
            ->get()
            ->groupBy(function ($msg) use ($userId) {
                $otherId = $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
                return $otherId;
            });

        $result = [];
        foreach ($conversations as $otherUserId => $messages) {
            $lastMessage = $messages->first();
            $unreadCount = $messages->filter(function ($msg) use ($userId) {
                return $msg->receiver_id === $userId && !$msg->read;
            })->count();

            $result[] = [
                'user' => $lastMessage->sender_id == $otherUserId
                    ? $lastMessage->sender
                    : $lastMessage->receiver,
                'last_message' => $lastMessage,
                'unread_count' => $unreadCount,
            ];
        }

        return response()->json($result);
    }

    public function conversation(Request $request, int $otherUserId): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::where(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $userId)->where('receiver_id', $otherUserId);
        })->orWhere(function ($q) use ($userId, $otherUserId) {
            $q->where('sender_id', $otherUserId)->where('receiver_id', $userId);
        })->with(['sender', 'receiver'])
          ->orderBy('created_at', 'asc')
          ->get();

        // Mark messages from the other user as read
        Message::where('sender_id', $otherUserId)
            ->where('receiver_id', $userId)
            ->where('read', false)
            ->update(['read' => true]);

        return response()->json($messages);
    }

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'listing_id' => ['sometimes', 'exists:listings,id'],
            'body' => ['required', 'string'],
        ]);

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $validated['receiver_id'],
            'listing_id' => $validated['listing_id'] ?? null,
            'body' => $validated['body'],
        ]);

        $message->load(['sender', 'receiver']);

        return response()->json($message, 201);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('receiver_id', $request->user()->id)
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
