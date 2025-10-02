"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SessionParticipant } from "@/entities/SessionParticipant";
import {
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SessionDetails({ session, onClose, onCancel, currentUser }) {
  const [participants, setParticipants] = useState([]);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadParticipants = async () => {
      const parts = await SessionParticipant.filter(
        { session_id: session.id },
        "-created_date"
      );
      setParticipants(parts);
      setLoading(false);
    };
    
    loadParticipants();
  }, [session.id]);

  const handleCancelSession = () => {
    if (cancelReason.trim()) {
      onCancel(session.id, cancelReason);
      setShowCancelForm(false);
    }
  };

  const canCancel =
    currentUser &&
    (session.created_by === currentUser.email || currentUser.role === "admin") &&
    session.status !== "cancelled" &&
    session.status !== "completed";

  const statusColors = {
    scheduled: "bg-emerald-100 text-emerald-700 border-emerald-200",
    full: "bg-amber-100 text-amber-700 border-amber-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {session.title}
              </DialogTitle>
              <p className="text-emerald-600 font-medium mt-1">
                {session.sport_name}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`${statusColors[session.status]} border`}
            >
              {session.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {session.status === "cancelled" && session.cancellation_reason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cancelled:</strong> {session.cancellation_reason}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">
                  {format(parseISO(session.date_time), "EEEE, MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Clock className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Time</p>
                <p className="font-semibold text-slate-900">
                  {format(parseISO(session.date_time), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <MapPin className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Venue</p>
                <p className="font-semibold text-slate-900">{session.venue}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Users className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Players</p>
                <p className="font-semibold text-slate-900">
                  {session.current_players_count}/{session.max_players}
                </p>
              </div>
            </div>
          </div>

          {session.description && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                {session.description}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Participants ({participants.length})
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
              </div>
            ) : participants.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No participants yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {participant.player_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {participant.player_email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canCancel && !showCancelForm && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelForm(true)}
              className="w-full"
            >
              Cancel Session
            </Button>
          )}

          {showCancelForm && (
            <div className="space-y-3 p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="font-semibold text-red-900">
                Please provide a reason for cancellation:
              </p>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Bad weather conditions..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelForm(false)}
                  className="flex-1"
                >
                  Nevermind
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSession}
                  disabled={!cancelReason.trim()}
                  className="flex-1"
                >
                  Confirm Cancellation
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}